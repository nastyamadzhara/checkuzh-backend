import {Body, Controller, Delete, Get, Param, Patch, Post, UnauthorizedException, UseGuards} from '@nestjs/common';
import { UsersService } from './users.service';
import {GetUser} from "../common/decorators/get-user.decorator";
import {User} from "./user.entity";
import {UpdateProfileDto} from "./dto/update-profile.dto";
import {AuthGuard} from "@nestjs/passport";

@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}
    @Get(':nickname')
    async getUser(@Param('nickname') nickname: string) {
        return this.usersService.findByNickname(nickname);
    }
    @Get('me')
    getMe(@GetUser() user: User) {
        if (!user) {
            throw new UnauthorizedException('Користувач не авторизований');
        }
        const { password, ...safeUser } = user;
        return safeUser;
    }
    @Patch('me')
    updateProfile(@GetUser() user: User, @Body() dto: UpdateProfileDto) {
        return this.usersService.updateUserProfile(user.id, dto);
    }

    @Get('me/favorites')
    getFavorites(@GetUser() user: User) {
        return this.usersService.getFavorites(user.id);
    }

    @Post('me/favorites')
    addToFavorites(@GetUser() user: User, @Body() body: { placeId: number }) {
        return this.usersService.addToFavorites(user.id, body.placeId);
    }

    @Delete('me/favorites/:placeId')
    removeFromFavorites(@GetUser() user: User, @Param('placeId') placeId: string) {
        return this.usersService.removeFromFavorites(user.id, +placeId);
    }
}
