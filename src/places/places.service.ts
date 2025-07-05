import {BadRequestException, Injectable, NotFoundException, UseGuards} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Place } from './place.entity';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { PlaceRating } from "./place-rating.entity";
import { User} from "../users/user.entity";
import {AuthGuard} from "@nestjs/passport";

@Injectable()
export class PlacesService {
    constructor(
        @InjectRepository(Place)
        private placeRepository: Repository<Place>,
        @InjectRepository(PlaceRating)
        private placeRatingRepository: Repository<PlaceRating>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private readonly httpService: HttpService,
    ) {}

    async findAll(): Promise<Place[]> {
        return this.placeRepository.find();
    }

    async findById(id: number): Promise<Place | null> {
        return this.placeRepository.findOne({ where: { id } });
    }

    private async reverseGeocode(lat: number, lon: number): Promise<string> {
        const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=uk`;

        try {
            const response$ = this.httpService.get(url, {
                headers: { 'User-Agent': 'checkuzh-app' },
            });
            const response = await lastValueFrom(response$);
            const address = response.data?.address;
            if (!address) return 'Адреса не знайдена';

            const parts: string[] = [];
            if (address.road) parts.push(address.road);
            else if (address.pedestrian) parts.push(address.pedestrian);
            else if (address.footway) parts.push(address.footway);

            if (address.house_number) {
                if (parts.length > 0) {
                    parts[parts.length - 1] += `, ${address.house_number}`;
                } else {
                    parts.push(address.house_number);
                }
            }

            if (address.suburb) parts.push(address.suburb);
            else if (address.city_district) parts.push(address.city_district);

            return parts.join(', ') || 'Адреса не знайдена';
        } catch (error) {
            console.error(`Reverse geocoding error for [${lat}, ${lon}]:`, error.message);
            return 'Адреса не знайдена';
        }
    }

    private async fetchWikidataImage(wikidataId: string): Promise<string | null> {
        const url = `https://www.wikidata.org/wiki/Special:EntityData/${wikidataId}.json`;

        try {
            const response$ = this.httpService.get(url);
            const response = await lastValueFrom(response$);
            const entities = response.data.entities;
            const entity = entities[wikidataId];
            const claims = entity?.claims;
            const imageClaim = claims?.P18?.[0]?.mainsnak?.datavalue?.value;

            if (imageClaim) {
                const filename = encodeURIComponent(imageClaim.replace(/ /g, '_'));
                return `https://commons.wikimedia.org/wiki/Special:FilePath/${filename}`;
            }

            return null;
        } catch (error) {
            console.error(`Wikidata fetch error for ${wikidataId}:`, error.message);
            return null;
        }
    }

    async importFromOsm(): Promise<{ message: string; places: Place[] }> {
        const query = `
      [out:json][timeout:25];
      area["name"="Ужгород"]->.searchArea;
      (
        (
          node["tourism"="artwork"](area.searchArea);
          node["tourism"="museum"](area.searchArea);
          node["leisure"="park"](area.searchArea);
          node["amenity"="theatre"](area.searchArea);
          node["historic"](area.searchArea);
        );
      );
      out center;
    `;

        const encodedQuery = encodeURIComponent(query);
        const url = `https://overpass-api.de/api/interpreter?data=${encodedQuery}`;

        const response$ = this.httpService.get(url, {
            headers: {
                'User-Agent': 'checkuzh-app',
                'Accept-Language': 'uk',
            },
        });

        const response = await lastValueFrom(response$);
        const elements = response.data.elements;
        const created: Place[] = [];

        for (const item of elements) {
            if (!item.tags?.name) continue;

            const name =
                item.tags?.name ||
                item.tags?.['alt_name'] ||
                item.tags?.['official_name'] ||
                item.tags?.['name:uk'] ||
                'Невідоме місце';

            const lat = item.lat;
            const lon = item.lon;

            const exists = await this.placeRepository
                .createQueryBuilder('place')
                .where('ABS(place.latitude - :lat) < 0.00005', { lat })
                .andWhere('ABS(place.longitude - :lon) < 0.00005', { lon })
                .getOne();
            if (exists) continue;

            const address = await this.reverseGeocode(lat, lon);

            let category = 'other';
            if (item.tags?.['artwork_type'] === 'statue' || item.tags?.tourism === 'artwork') {
                category = 'statue';
            } else if (item.tags?.tourism === 'museum') {
                category = 'museum';
            } else if (item.tags?.leisure === 'park') {
                category = 'park';
            } else if (item.tags?.amenity === 'theatre') {
                category = 'theatre';
            } else if (item.tags?.historic) {
                category = 'historic';
            }
            let imageUrl: string | null = null;
            const wikidataId = item.tags?.wikidata;
            if (wikidataId) {
                imageUrl = await this.fetchWikidataImage(wikidataId);
            }

            if (!imageUrl && item.tags?.image) {
                imageUrl = item.tags.image;
            }

            const newPlace = this.placeRepository.create({
                name,
                description: item.tags?.description || category,
                address,
                latitude: lat,
                longitude: lon,
                category,
                imageUrl,
            });

            try {
                const saved = await this.placeRepository.save(newPlace);
                created.push(saved);
            } catch (err) {
                console.error(`Error saving place "${name}":`, err.message);
                if (err.code !== '23505') throw err;
            }
        }

        return {
            message: `Імпортовано ${created.length} нових місць з Overpass API.`,
            places: created,
        };
    }
    async updatePlace(id: number, updateData: Partial<Place>): Promise<Place> {
        const place = await this.placeRepository.findOne({ where: { id } });
        if (!place) {
            throw new Error(`Place with ID ${id} not found`);
        }

        Object.assign(place, updateData);
        return this.placeRepository.save(place);
    }
    async removePlace(id: number): Promise<{ message: string }> {
        const place = await this.placeRepository.findOne({ where: { id } });

        if (!place) {
            throw new Error(`Place with ID ${id} not found`);
        }

        await this.placeRepository.remove(place);
        return { message: `Place with ID ${id} was deleted` };
    }
    async findStatues(): Promise<Place[]> {
        return this.placeRepository.find({
            where: { category: 'statue' },
        });
    }
    async ratePlace(placeId: number, userId: number, rating: number): Promise<{ message: string }> {
        if (rating < 1 || rating > 5) {
            throw new BadRequestException('Rating must be between 1 and 5');
        }

        const place = await this.placeRepository.findOne({ where: { id: placeId } });
        if (!place) throw new NotFoundException('Place not found');

        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        let ratingRecord = await this.placeRatingRepository.findOne({
            where: { user: { id: userId }, place: { id: placeId } },
            relations: ['user', 'place'],
        });

        if (ratingRecord) {
            ratingRecord.rating = rating;
        } else {
            ratingRecord = this.placeRatingRepository.create({
                user: { id: userId } as User,
                place: { id: placeId } as Place,
                rating,
            });
        }

        await this.placeRatingRepository.save(ratingRecord);

        // Оновлюємо середній рейтинг місця
        const allRatings = await this.placeRatingRepository.find({ where: { place: { id: placeId } } });
        const avg = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;
        place.rating = Math.round(avg * 10) / 10;

        await this.placeRepository.save(place);

        return { message: 'Rating saved' };
    }

}
