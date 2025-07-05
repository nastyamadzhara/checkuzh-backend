import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuestProgress } from './quest-progress.entity';
import { Place } from '../places/place.entity';
import { User } from '../users/user.entity';

@Injectable()
export class QuestService {
    constructor(
        @InjectRepository(QuestProgress)
        private readonly questProgressRepository: Repository<QuestProgress>,

        @InjectRepository(Place)
        private readonly placeRepository: Repository<Place>,

        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async getStatues(page: number, limit: number) {
        const [items, total] = await this.placeRepository.findAndCount({
            where: { category: 'statue' },
            skip: (page - 1) * limit,
            take: limit,
        });

        return { items, total, page, limit };
    }

    async submitStatue(user: User, latitude: number, longitude: number) {
        const TOLERANCE = 0.0001;

        const place = await this.placeRepository
            .createQueryBuilder('place')
            .where('place.category = :cat', { cat: 'statue' })
            .andWhere('ABS(place.latitude - :lat) < :tol', { lat: latitude, tol: TOLERANCE })
            .andWhere('ABS(place.longitude - :lon) < :tol', { lon: longitude, tol: TOLERANCE })
            .getOne();

        if (!place) throw new NotFoundException('Фігурку не знайдено поруч');

        const exists = await this.questProgressRepository.findOne({
            where: { user: { id: user.id }, place: { id: place.id } },
        });

        if (exists) {
            return { message: 'Ви вже відкрили цю статуетку' };
        }

        const progress = this.questProgressRepository.create({ user, place });
        await this.questProgressRepository.save(progress);

        return { message: 'Статуетку зараховано до прогресу!' };
    }

    async getUserQuest(user: User) {
        const progress = await this.questProgressRepository.find({
            where: { user: { id: user.id } },
        });

        const total = await this.placeRepository.count({ where: { category: 'statue' } });

        const found = progress.length;
        const places = progress.map(p => p.place); // eager: true

        return {
            total,
            found,
            percentage: total > 0 ? Math.round((found / total) * 100) : 0,
            foundPlaces: places,
        };
    }
}