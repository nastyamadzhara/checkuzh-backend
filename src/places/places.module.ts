import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { PlacesService } from './places.service';
import { PlacesController } from './places.controller';
import { Place } from "./place.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Place]), HttpModule],
    controllers: [PlacesController],
    providers: [PlacesService],
})
export class PlacesModule {}
