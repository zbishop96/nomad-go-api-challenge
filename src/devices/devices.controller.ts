import { Controller, Get, Post, Delete, Put, Param, Req, Body } from '@nestjs/common';
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

/* 
    @Put(':uuid')
    update(@Param('uuid') id: string, @Body() device: Device) {
      return `Updates the lat / long of a device`;
    }

    @Delete(':uuid')
    remove(@Param('uuid') id: string) {
      return `This action removes a device`;
    }
*/

}
