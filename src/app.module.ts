import { Module } from '@nestjs/common';
import { DevicesController } from './devices/devices.controller';
import { DevicesService } from './devices/devices.service';
import { TemperaturesController } from './temperatures/temperatures.controller';
import { TemperaturesService } from './temperatures/temperatures.service';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [CacheModule.register()],
  controllers: [DevicesController, TemperaturesController],
  providers: [DevicesService, TemperaturesService],
})
export class AppModule {}
