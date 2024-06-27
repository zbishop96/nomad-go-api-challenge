import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { Temperature } from './Temperature';
import { TemperaturesService } from './temperatures.service';
@Controller('temperatures')
export class TemperaturesController {
    constructor(private readonly temperaturesService: TemperaturesService) {}

    @Post()
    async createTemperatureReading(@Body() temperature: Temperature) {
        return await this.temperaturesService.createNewReading(temperature);
    }

    @Get('/daily/:aggregationType')
    getDailyAggregation(@Param('aggregationType') aggregationType: 'high' | 'low' | 'average'): string {
        
        return 'Gets an aggregated value of temperatures for the day'
    }
}
