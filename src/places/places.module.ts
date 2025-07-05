import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlacesService } from './places.service';
import { PlacesController } from './places.controller';
import { Place } from './place.entity';
import { PlaceRating } from './place-rating.entity';
import { User } from '../users/user.entity';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [
        TypeOrmModule.forFeature([Place, PlaceRating, User]),
        HttpModule,
    ],
    controllers: [PlacesController],
    providers: [PlacesService],
    exports: [PlacesService],
})
export class PlacesModule {}
