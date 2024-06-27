import { Test, TestingModule } from '@nestjs/testing';
import { TemperaturesController } from './temperatures.controller';

describe('TemperaturesController', () => {
  let controller: TemperaturesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TemperaturesController],
    }).compile();

    controller = module.get<TemperaturesController>(TemperaturesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
