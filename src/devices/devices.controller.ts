import { Controller, Get, Post, Delete, Put, Param, Req, Body } from '@nestjs/common';
import { Device } from './Device';
import { DevicesService } from './devices.service';

@Controller('devices')
export class DevicesController {

    constructor(private deviceService: DevicesService) {}

    @Post()
    enrollDevice(@Body() device: Device): Device {
        this.deviceService.enroll(device);
        return device
    }

    @Get(':uuid')
    getDevice(@Param('uuid') uuid: string): string {
        return 'Gets information about a device'
    }

    @Put(':uuid')
    update(@Param('uuid') id: string, @Body() device: Device) {
      return `Updates the lat / long of a device`;
    }

    @Delete(':uuid')
    remove(@Param('uuid') id: string) {
      return `This action removes a device`;
    }
}
