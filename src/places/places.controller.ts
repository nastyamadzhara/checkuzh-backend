// src/places/places.controller.ts
import {Controller, Get, Post, Param, Body, Patch, Delete} from '@nestjs/common';
import { PlacesService } from './places.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import {UpdatePlaceDto} from "./dto/update-place.dto.";

@Controller('places')
export class PlacesController {
    constructor(private readonly placesService: PlacesService) {}

    @Get()
    findAll() {
        return this.placesService.findAll();
    }

    @Get('statues')
    getStatues() {
        return this.placesService.findStatues();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.placesService.findById(+id);
    }

    @Post('/import/osm')
    importFromOsm() {
        return this.placesService.importFromOsm();
    }

    @Patch(':id')
    async updatePlace(
        @Param('id') id: string,
        @Body() updateDto: UpdatePlaceDto
    ) {
        return this.placesService.updatePlace(+id, updateDto);
    }



    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.placesService.removePlace(+id);
    }
}
