import { HttpException, HttpStatus, Injectable, Inject } from '@nestjs/common';
import { UUID, randomUUID } from 'crypto';
import { Temperature } from './Temperature';
import { DevicesService } from '../devices/devices.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import * as _ from 'lodash';
import { CreateTemperatureDto } from './CreateTemperatureDto';

export interface TemperatureAverage {
  temperature: number;
  dateTime: Date;
  numReadings: number;
}

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
    const currentDate = new Date();
    let high: Temperature = await this.cacheManager.get('high');
    let low: Temperature = await this.cacheManager.get('low');
    let average: TemperatureAverage = await this.cacheManager.get('average');
    if (this.compareDay(currentDate, high.dateTime)) {
      await this.cacheManager.del('high');
      high = undefined;
    }
    if (this.compareDay(currentDate, low.dateTime)) {
      await this.cacheManager.del('low');
      low = undefined;
    }
    if (this.compareDay(currentDate, average.dateTime)) {
      await this.cacheManager.del('average');
      average = undefined;
    }

    return {
      high: high,
      low: low,
      average: average,
    };
  }

  compareDay(date: Date, otherDate: Date): boolean {
    return (
      new Date(date.getFullYear(), date.getMonth(), date.getDate()) >
      new Date(
        otherDate.getFullYear(),
        otherDate.getMonth(),
        otherDate.getDate(),
      )
    );
  }

  async updateCachedValues(temperature: Temperature) {
    const cachedHigh: Temperature | undefined =
      await this.cacheManager.get('high');
    const cachedLow: Temperature | undefined =
      await this.cacheManager.get('low');
    const cachedAverage: TemperatureAverage | undefined =
      await this.cacheManager.get('average');
    if (
      !cachedHigh ||
      temperature.temperature > cachedHigh.temperature ||
      this.compareDay(temperature.dateTime, cachedHigh.dateTime)
    ) {
      this.cacheManager.set('high', temperature, 0);
    }

    if (
      !cachedLow ||
      temperature.temperature < cachedLow.temperature ||
      this.compareDay(temperature.dateTime, cachedLow.dateTime)
    ) {
      this.cacheManager.set('low', temperature, 0);
    }

    if (
      !cachedAverage ||
      this.compareDay(temperature.dateTime, cachedAverage.dateTime)
    ) {
      await this.cacheManager.set(
        'average',
        {
          temperature: temperature.temperature,
          dateTime: temperature.dateTime,
          numReadings: 1,
        },
        0,
      );
    } else {
      const average = (await this.cacheManager.get(
        'average',
      )) as TemperatureAverage;
      const newAverage =
        (average.numReadings * average.temperature + temperature.temperature) /
        (average.numReadings + 1);
      await this.cacheManager.set(
        'average',
        {
          temperature: newAverage,
          dateTime: temperature.dateTime,
          numReadings: average.numReadings + 1,
        },
        0,
      );
    }
  }
}
