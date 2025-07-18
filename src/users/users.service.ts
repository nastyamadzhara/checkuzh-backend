// users/users.service.ts
import {Injectable, NotFoundException, UnauthorizedException} from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcryptjs from 'bcryptjs';
import {UpdateProfileDto} from "./dto/update-profile.dto";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async findByNickname(nickname: string): Promise<User | null> {
        const user = await this.userRepository.findOne({ where: { nickname } });
        return user;
    }
    async findById(id: number): Promise<User | null> {
        const user = await this.userRepository.findOne({ where: { id } });
        return user;
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
        if (user )Object.assign(user, dto);
        else throw new UnauthorizedException();
        return this.userRepository.save(user);
    }

    async createUser(userData: Partial<User>): Promise<User> {
        const user = this.userRepository.create(userData);
        return this.userRepository.save(user);
    }
}
