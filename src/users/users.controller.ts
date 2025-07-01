import {Body, Controller, Get, Param, Patch, UnauthorizedException, UseGuards} from '@nestjs/common';
import { UsersService } from './users.service';
import {GetUser} from "../common/decorators/get-user.decorator";
import {User} from "./user.entity";
import {UpdateProfileDto} from "./dto/update-profile.dto";
import {AuthGuard} from "@nestjs/passport";

@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}
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
}
