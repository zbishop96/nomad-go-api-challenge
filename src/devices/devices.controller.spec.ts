import { Test, TestingModule } from '@nestjs/testing';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';
import { UUID } from 'crypto';

describe('DevicesController', () => {
  let controller: DevicesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DevicesController],
      providers: [DevicesService],
    }).compile();

    controller = module.get<DevicesController>(DevicesController);
  });

  const testValidDevice = {
    id: '09fb39ee-8c65-4dba-ad14-c90d223b0c6f' as UUID,
    latitude: 10,
    longitude: 20,
  };

  const testInvalidDevice = {
    id: '09fb39ee-8c65-4dba-ad14-c90d223b0c6f' as UUID,
    latitude: 1000,
    longitude: 20,
  };

  it('should return the device submitted with an API key for future requests.', async () => {
    const result = await controller.enrollDevice(testValidDevice);
    expect(result.id).toEqual(testValidDevice.id);
    expect(result.latitude).toEqual(testValidDevice.latitude);
    expect(result.longitude).toEqual(testValidDevice.longitude);
    expect(result.apiKey).toBeDefined();
  });
});
