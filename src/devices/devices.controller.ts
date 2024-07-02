import {
  Controller,
  Get,
  Post,
  Delete,
  Put,
  Param,
  Req,
  Body,
} from '@nestjs/common';
import { Device } from './Device';
import { DevicesService } from './devices.service';
import { UUID } from 'crypto';
import { CreateDeviceDto } from './CreateDeviceDto';

@Controller('devices')
export class DevicesController {
  constructor(private deviceService: DevicesService) {}

  @Post()
  async enrollDevice(@Body() device: CreateDeviceDto): Promise<Device> {
    return await this.deviceService.enroll(device);
  }

  @Get(':uuid')
  getDevice(@Param('uuid') uuid: string): Device {
    return this.deviceService.get(uuid as UUID);
  }
}
