import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestController } from './quest.controller';
import { QuestService } from './quest.service';
import { QuestProgress } from './quest-progress.entity';
import { Place } from 'src/places/place.entity';
import { User } from 'src/users/user.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([QuestProgress, Place, User]),
    ],
    controllers: [QuestController],
    providers: [QuestService],
})
export class QuestModule {}