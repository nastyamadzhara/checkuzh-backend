// auth/auth.service.ts
import {BadRequestException, Injectable, UnauthorizedException} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
import { User } from '../users/user.entity';
import * as bcryptjs from 'bcryptjs';


@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) {}
    async register(userData: RegisterDto): Promise<User> {
        // Перевірка, чи користувач з таким nickname вже існує
        const existingUser = await this.usersService.findByNickname(userData.nickname);
        if (existingUser) {
            throw new BadRequestException('Користувач з таким nickname вже існує');
        }
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(userData.password, salt);
        const newUser = await this.usersService.createUser({
            nickname: userData.nickname,
            password: hashedPassword,
        });
        return newUser;
    }

    async login(loginDto: LoginDto, res: Response): Promise<{ accessToken: string }> {
        const { nickname, password } = loginDto;
        const user = await this.usersService.validateUserPassword(nickname, password);
        if (!user) {
            throw new UnauthorizedException('Невірний логін або пароль');
        }
        const accessToken = this.generateAccessToken(user);
        const refreshToken = this.generateRefreshToken(user);
        this.setRefreshCookie(res, refreshToken);
        return { accessToken };
    }

    async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
        try {
            const decoded = this.jwtService.verify(refreshToken);
            const user = await this.usersService.findById(decoded.id);
            if (!user) throw new UnauthorizedException('Користувача не знайдено');

            const newAccessToken = this.generateAccessToken(user);
            return { accessToken: newAccessToken };
        } catch (error) {
            throw new UnauthorizedException('Невалідний refresh-токен');
        }
    }

    private generateAccessToken(user: User): string {
        return this.jwtService.sign(
            { id: user.id},
            { expiresIn: '15m' },
        );
    }

    private generateRefreshToken(user: User): string {
        return this.jwtService.sign(
            { id: user.id },
            { expiresIn: '14d' },
        );
    }

    private setRefreshCookie(res: Response, token: string) {
        res.cookie('refreshToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });
    }

    private clearRefreshCookie(res: Response) {
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });
    }

    async logout(res: Response): Promise<{ message: string }> {
        res.clearCookie('refreshToken');
        return { message: 'Вихід успішний' };
    }
}
