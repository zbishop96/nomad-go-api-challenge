import { HttpException, HttpStatus, Injectable, Inject } from '@nestjs/common';
import { UUID, randomUUID } from 'crypto';
import { Temperature } from './Temperature';
import { DevicesService } from '../devices/devices.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class TemperaturesService {
    constructor(private readonly deviceService: DevicesService, @Inject(CACHE_MANAGER) private cacheManager: Cache) {}

    private readonly temperatures: Map<UUID, Temperature> = new Map();

    async createNewReading(temperature: Temperature) {
        if (this.deviceService.get(temperature.deviceUuid)) {
            this.temperatures.set(randomUUID(), temperature);
            const cachedHigh = await this.cacheManager.get('high');
            const cachedLow = await this.cacheManager.get('low');

            return temperature;
        } else {
            throw new HttpException('Device is not enrolled.', HttpStatus.BAD_REQUEST);
        }
    }

    getAggregation(aggregation: 'high'|'low'|'average') {
        

    }
}
