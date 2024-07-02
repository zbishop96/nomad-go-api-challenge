import { Test, TestingModule } from '@nestjs/testing';
import { CacheModule } from '@nestjs/cache-manager';
import { TemperaturesService } from './temperatures.service';
import { DevicesService } from '../devices/devices.service';
import { UUID } from 'crypto';
import { Temperature } from './Temperature';


describe('TemperaturesService', () => {
  let temperaturesService: TemperaturesService;
  let devicesService: DevicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [TemperaturesService, DevicesService],
    }).compile();

    temperaturesService = module.get<TemperaturesService>(TemperaturesService);
    devicesService = module.get<DevicesService>(DevicesService);
  });

  const testValidDevice = {
    id: "09fb39ee-8c65-4dba-ad14-c90d223b0c6f" as UUID,
    latitude: 10,
    longitude: 20
  }

  const testValidReading = {
    deviceId: "09fb39ee-8c65-4dba-ad14-c90d223b0c6f" as UUID,
    temperature: 60
  }

  it('Should create a new temperature reading', async () => {
    await devicesService.enroll(testValidDevice);
    const result = await temperaturesService.createNewReading(testValidReading);
    expect(result.deviceId).toStrictEqual(testValidReading.deviceId)
    expect(result.temperature).toStrictEqual(testValidReading.temperature)
    expect(result.dateTime).toBeDefined()
    expect(result.id).toBeDefined()
  })

  it('Should reject a temperature reading with a non-enrolled device ID', async () => {
    await expect(temperaturesService.createNewReading(testValidReading)).rejects.toThrow()
  })

  it('Should update the cached values', async () => {
    await devicesService.enroll(testValidDevice);
    await temperaturesService.createNewReading(testValidReading);
    const aggregateValues = await temperaturesService.getAllAggregation()
    expect(aggregateValues.high).toBeDefined()
    expect(aggregateValues.low).toBeDefined()
    expect(aggregateValues.average).toBeDefined()
  })


  it('Should replace a cached value if the date is the next calendar day', async () => {
    await devicesService.enroll(testValidDevice);
    await temperaturesService.createNewReading(testValidReading);

    const dayAfterToday = new Date(new Date().getTime() + (1000 * 60 * 60 * 24))
    await temperaturesService.updateCachedValues({
      id: "124a78d1-8fef-49cc-8d38-fec0da2fc3c0",
      temperature: 50,
      deviceId: testValidDevice.id,
      dateTime: dayAfterToday
    })
    const result: Temperature = await temperaturesService.getAggregation('high')
    expect(result.temperature).toStrictEqual(50);
  })

  it('Should replace a cached value if value is a higher degree of low or high', async () => {
    await devicesService.enroll(testValidDevice);
    await temperaturesService.createNewReading(testValidReading);

    await temperaturesService.updateCachedValues({
      id: "124a78d1-8fef-49cc-8d38-fec0da2fc3c0",
      temperature: 61,
      deviceId: testValidDevice.id,
      dateTime: new Date()
    })
    const result: Temperature = await temperaturesService.getAggregation('high')
    expect(result.temperature).toStrictEqual(61);
  })

  it('Should alter the average if the reading is same day', async () => {
    await devicesService.enroll(testValidDevice);
    await temperaturesService.createNewReading(testValidReading);

    await temperaturesService.updateCachedValues({
      id: "124a78d1-8fef-49cc-8d38-fec0da2fc3c0",
      temperature: 70,
      deviceId: testValidDevice.id,
      dateTime: new Date()
    })
    const result: Temperature = await temperaturesService.getAggregation('average')
    expect(result.temperature).toStrictEqual(65);
  })

});
