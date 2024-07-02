import { Test, TestingModule } from '@nestjs/testing';
import { TemperaturesController } from './temperatures.controller';
import { DevicesController } from '../devices/devices.controller';
import { UUID } from 'crypto';
import { TemperaturesService } from './temperatures.service';
import { DevicesService } from '../devices/devices.service';
import { CacheModule } from '@nestjs/cache-manager';

describe('TemperaturesController', () => {
  let temperaturesController: TemperaturesController;
  let devicesController: DevicesController;
  let temperaturesService: TemperaturesService;
  let devicesService: DevicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TemperaturesController, DevicesController],
      providers: [TemperaturesService, DevicesService],
      imports: [CacheModule.register()],
    }).compile();

    temperaturesController = module.get<TemperaturesController>(
      TemperaturesController,
    );
    devicesController = module.get<DevicesController>(DevicesController);
    temperaturesService = module.get<TemperaturesService>(TemperaturesService);
    devicesService = module.get<DevicesService>(DevicesService);
  });

  const testValidDevice = {
    id: '09fb39ee-8c65-4dba-ad14-c90d223b0c6f' as UUID,
    latitude: 10,
    longitude: 20,
  };

  const testValidReading = {
    deviceId: '09fb39ee-8c65-4dba-ad14-c90d223b0c6f' as UUID,
    temperature: 65,
  };

  it('Should create a new reading', async () => {
    await devicesController.enrollDevice(testValidDevice);
    const result =
      await temperaturesController.createTemperatureReading(testValidReading);
    expect(result.temperature).toEqual(testValidReading.temperature);
    expect(result.deviceId).toEqual(testValidReading.deviceId);
    expect(result.id).toBeDefined();
    expect(result.dateTime).toBeDefined();
  });

  it('Should return the individual daily values', async () => {
    await devicesController.enrollDevice(testValidDevice);
    await temperaturesController.createTemperatureReading(testValidReading);
    await temperaturesController.createTemperatureReading({
      ...testValidReading,
      temperature: 70,
    });
    const highResult = await temperaturesController.getDailyAggregation('high');
    const lowResult = await temperaturesController.getDailyAggregation('low');
    const averageResult =
      await temperaturesController.getDailyAggregation('average');

    expect(highResult.temperature).toStrictEqual(70);
    expect(lowResult.temperature).toStrictEqual(65);
    expect(averageResult.temperature).toStrictEqual(67.5);
  });

  it('Should return all of the daily values', async () => {
    await devicesController.enrollDevice(testValidDevice);
    await temperaturesController.createTemperatureReading(testValidReading);
    await temperaturesController.createTemperatureReading({
      ...testValidReading,
      temperature: 70,
    });
    const results = await temperaturesController.getDailyAll();
    expect(results.high.temperature).toStrictEqual(70);
    expect(results.low.temperature).toStrictEqual(65);
    expect(results.average.temperature).toStrictEqual(67.5);
  });
});
