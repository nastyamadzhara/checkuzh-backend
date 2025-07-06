import {Controller, Get, Post, Param, Body, Patch, Delete, UseGuards, Req, Query, ParseIntPipe} from '@nestjs/common';
import { PlacesService } from './places.service';
import {UpdatePlaceDto} from "./dto/update-place.dto.";
import {AuthGuard} from "@nestjs/passport";
import {GetUser} from "../common/decorators/get-user.decorator";
import {User} from "../users/user.entity";

@Controller('places')
export class PlacesController {
    constructor(private readonly placesService: PlacesService) {}

    @Get('all')
    getAllPlaces() {
        return this.placesService.findAllWithoutPagination();
    }

    @Get()
    findAll(
        @Query('category') category?: string,
        @Query('page') page = 1,
        @Query('limit') limit = 20,
    ) {
        return this.placesService.findAll({ category, page: +page, limit: +limit });
    }

    @Get('statues')
    getStatues() {
        return this.placesService.findStatues();
    }

    @Get('categories')
    getCategories() {
        return this.placesService.getCategories();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.placesService.findById(id);
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

    @Post(':id/rate')
    @UseGuards(AuthGuard('jwt'))
    ratePlace(@Param('id') id: string, @GetUser() user: User, @Body() body: { rating: number }) {
        return this.placesService.ratePlace(+id, user.id, body.rating);
    }
}
