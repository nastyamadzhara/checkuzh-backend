import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcryptjs from 'bcryptjs';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Place } from '../places/place.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        @InjectRepository(Place)
        private readonly placeRepository: Repository<Place>,
    ) {}

    async findByNickname(nickname: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { nickname } });
    }

    async findById(id: number): Promise<User | null> {
        return this.userRepository.findOne({ where: { id } });
    }

    async validateUserPassword(nickname: string, password: string): Promise<User> {
        const user = await this.findByNickname(nickname);
        if (!user) {
            throw new UnauthorizedException();
        }
        const isPasswordValid = await bcryptjs.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Невірний пароль');
        }
        return user;
    }

    async updateUserProfile(id: number, dto: UpdateProfileDto): Promise<User> {
        const user = await this.findById(id);
        if (!user) throw new UnauthorizedException();
        Object.assign(user, dto);
        return this.userRepository.save(user);
    }

    async createUser(userData: Partial<User>): Promise<User> {
        const user = this.userRepository.create(userData);
        return this.userRepository.save(user);
    }

    async addToFavorites(userId: number, placeId: number): Promise<{ message: string }> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['favorites'],
        });
        const place = await this.placeRepository.findOne({
            where: { id: placeId },
            relations: ['favoritedBy'],
        });

        if (!user || !place) throw new NotFoundException();

        const alreadyAdded = user.favorites.some(p => p.id === placeId);

        if (!alreadyAdded) {
            user.favorites.push(place);
            user.likedCount = user.favorites.length;
            await this.userRepository.save(user);

            // Оновлюємо place.favoritedBy, щоб отримати актуальну кількість лайків
            const updatedPlace = await this.placeRepository.findOne({
                where: { id: placeId },
                relations: ['favoritedBy'],
            });
            if (updatedPlace) {
                updatedPlace.likes = updatedPlace.favoritedBy.length;
                await this.placeRepository.save(updatedPlace);
            }
        }

        return { message: 'Added to favorites' };
    }

    async removeFromFavorites(userId: number, placeId: number): Promise<{ message: string }> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['favorites'],
        });
        const place = await this.placeRepository.findOne({
            where: { id: placeId },
            relations: ['favoritedBy'],
        });

        if (!user || !place) throw new NotFoundException();

        user.favorites = user.favorites.filter(p => p.id !== placeId);
        user.likedCount = user.favorites.length;
        await this.userRepository.save(user);

        // Оновлюємо place.favoritedBy, щоб отримати актуальну кількість лайків
        const updatedPlace = await this.placeRepository.findOne({
            where: { id: placeId },
            relations: ['favoritedBy'],
        });
        if (updatedPlace) {
            updatedPlace.likes = updatedPlace.favoritedBy.length;
            await this.placeRepository.save(updatedPlace);
        }

        return { message: 'Removed from favorites' };
    }

    async getFavorites(userId: number): Promise<Place[]> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['favorites'],
        });
        if (!user) throw new NotFoundException();
        return user.favorites;
    }
}
