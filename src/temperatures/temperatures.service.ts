import { HttpException, HttpStatus, Injectable, Inject } from '@nestjs/common';
import { UUID, randomUUID } from 'crypto';
import { Temperature } from './Temperature';
import { DevicesService } from '../devices/devices.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import * as _ from 'lodash';
import { CreateTemperatureDto } from './CreateTemperatureDto';

@Injectable()
export class TemperaturesService {
  constructor(
    private readonly deviceService: DevicesService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private readonly temperatures: Map<UUID, Temperature> = new Map();

  async createNewReading(
    temperature: CreateTemperatureDto,
  ): Promise<Temperature> {
    if (this.deviceService.get(temperature.deviceId)) {
      const id = randomUUID();
      const newTemperatureReading = {
        ...temperature,
        id: id,
        dateTime: new Date(),
      };
      this.temperatures.set(id, newTemperatureReading);
      await this.updateCachedValues(newTemperatureReading);
      return newTemperatureReading;
    } else {
      throw new HttpException(
        'Device is not enrolled.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getAggregation(
    aggregation: 'high' | 'low' | 'average',
  ): Promise<Temperature> {
    if (!this.cacheManager.get(aggregation)) {
      console.error(`${aggregation} not set`);
    } else {
      return await this.cacheManager.get(aggregation);
    }
  }

  async getAllAggregation() {
    return {
      high: await this.cacheManager.get('high'),
      low: await this.cacheManager.get('low'),
      average: await this.cacheManager.get('average'),
    };
  }

  async updateCachedValues(temperature: Temperature) {
    const cachedHigh: Temperature | undefined =
      await this.cacheManager.get('high');
    const cachedLow: Temperature | undefined =
      await this.cacheManager.get('low');
    const cachedAverage:
      | { temperature: number; date: Date; numReadings: number }
      | undefined = await this.cacheManager.get('average');
    if (
      !cachedHigh ||
      temperature.temperature > cachedHigh.temperature ||
      new Date(
        temperature.dateTime.getFullYear(),
        temperature.dateTime.getMonth(),
        temperature.dateTime.getDate(),
      ) >
        new Date(
          cachedHigh.dateTime.getFullYear(),
          cachedHigh.dateTime.getMonth(),
          cachedHigh.dateTime.getDate(),
        )
    ) {
      this.cacheManager.set('high', temperature, 0);
    }

    if (
      !cachedLow ||
      temperature.temperature < cachedLow.temperature ||
      new Date(
        temperature.dateTime.getFullYear(),
        temperature.dateTime.getMonth(),
        temperature.dateTime.getDate(),
      ) >
        new Date(
          cachedLow.dateTime.getFullYear(),
          cachedLow.dateTime.getMonth(),
          cachedLow.dateTime.getDate(),
        )
    ) {
      this.cacheManager.set('low', temperature, 0);
    }

    if (
      !cachedAverage ||
      new Date(
        temperature.dateTime.getFullYear(),
        temperature.dateTime.getMonth(),
        temperature.dateTime.getDate(),
      ) >
        new Date(
          cachedAverage.date.getFullYear(),
          cachedAverage.date.getMonth(),
          cachedAverage.date.getDate(),
        )
    ) {
      await this.cacheManager.set(
        'average',
        {
          temperature: temperature.temperature,
          date: temperature.dateTime,
          numReadings: 1,
        },
        0,
      );
    } else {
      const average = (await this.cacheManager.get('average')) as {
        temperature: number;
        date: Date;
        numReadings: number;
      };
      const newAverage =
        (average.numReadings * average.temperature + temperature.temperature) /
        (average.numReadings + 1);
      await this.cacheManager.set(
        'average',
        {
          temperature: newAverage,
          date: temperature.dateTime,
          numReadings: average.numReadings + 1,
        },
        0,
      );
    }
  }
}
