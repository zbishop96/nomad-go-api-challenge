import { Test, TestingModule } from '@nestjs/testing';
import { DevicesService } from './devices.service';
import { UUID } from 'crypto';

describe('DevicesService', () => {
  let service: DevicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DevicesService],
    }).compile();

    service = module.get<DevicesService>(DevicesService);
  });

  const testValidDevice = {
    id: "09fb39ee-8c65-4dba-ad14-c90d223b0c6f" as UUID,
    latitude: 10,
    longitude: 20
  }

  it('Should enroll a device and return the raw API key', async () => {
    const result = await service.enroll(testValidDevice);
    expect(result.id).toEqual(testValidDevice.id)
    expect(result.latitude).toEqual(testValidDevice.latitude)
    expect(result.longitude).toEqual(testValidDevice.longitude)
    expect(result.apiKey).toBeDefined();
  })

  it('Should reject a device with an invalid ID', async () => {
    await expect(service.enroll({...testValidDevice, id: "" as UUID})).rejects.toThrow()
    await expect(service.enroll({...testValidDevice, id: "12345" as UUID})).rejects.toThrow()
  })

  it('Should reject a device with invalid latitude or longitude', async () => {
    await expect(service.enroll({...testValidDevice, latitude: 100})).rejects.toThrow()
    await expect(service.enroll({...testValidDevice, longitude: 300})).rejects.toThrow()
  })

  it('Should get a device from a UUID', async () => {
    await service.enroll(testValidDevice);
    const result = service.get(testValidDevice.id);
    expect(result.id).toEqual(testValidDevice.id)
    expect(result.latitude).toEqual(testValidDevice.latitude)
    expect(result.longitude).toEqual(testValidDevice.longitude)
    expect(result.apiKey).toBeDefined();
  })
});
