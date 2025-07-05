import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { QuestService } from './quest.service';
import { GetUser } from '../common/decorators/get-user.decorator';
import { User } from '../users/user.entity';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('quest')
export class QuestController {
    constructor(private readonly questService: QuestService) {}

    @Get('statues')
    getStatues(
        @Query('page') page = 1,
        @Query('limit') limit = 20,
    ) {
        return this.questService.getStatues(+page, +limit);
    }

    @Post('submit')
    submitStatue(
        @GetUser() user: User,
        @Body() body: { latitude: number; longitude: number },
    ) {
        return this.questService.submitStatue(user, body.latitude, body.longitude);
    }

    @Get('/me')
    getUserQuest(@GetUser() user: User) {
        return this.questService.getUserQuest(user);
    }
}
