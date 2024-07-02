import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { Temperature } from './Temperature';
import { TemperaturesService } from './temperatures.service';
import { CreateTemperatureDto } from './CreateTemperatureDto';
@Controller('temperatures')
export class TemperaturesController {
    constructor(private readonly temperaturesService: TemperaturesService) {}

    @Post()
    async createTemperatureReading(@Body() temperature: CreateTemperatureDto): Promise<Temperature> {
        return await this.temperaturesService.createNewReading(temperature);
    }

    @Get('/daily/:aggregationType')
    async getDailyAggregation(@Param('aggregationType') aggregationType: 'high' | 'low' | 'average') {
        return await this.temperaturesService.getAggregation(aggregationType);
    }

    @Get('/daily')
    async getDailyAll() {
        return await this.temperaturesService.getAllAggregation();
    }
}
