import {Controller, Post, Body, Res, UseGuards, Req, UnauthorizedException, BadRequestException, UsePipes, ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Response } from 'express';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    @UsePipes(new ValidationPipe())
    async register(@Body() userData: RegisterDto) {
        return await this.authService.register(userData);
    }

    @Post('login')
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async login(
        @Body() body: LoginDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const { nickname, password } = body;
        const tokens = await this.authService.login({ nickname, password }, res);
        return res.json(tokens);
    }


    @Post('refresh')
    async refresh(@Req() req) {
        const refreshToken = req.cookies?.refreshToken;
        if (!refreshToken) throw new UnauthorizedException('Немає refresh токена');
        return await this.authService.refreshToken(refreshToken);
    }

    @Post('logout')
    async logout(@Res({ passthrough: true }) res: Response) {
        return await this.authService.logout(res);
    }

}
