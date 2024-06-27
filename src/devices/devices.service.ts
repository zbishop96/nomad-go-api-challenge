import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Device } from './Device';
import { UUID } from 'crypto';

@Injectable()
export class DevicesService {

    private readonly devices: Map<UUID, Device> = new Map();

    enroll(device: Device): Device {
        if (device.latitude > 90 || device.latitude < -90 || device.longitude > 180 || device.longitude < -180) {
            throw new HttpException('Device latitude or longitude ranges are invalid.', HttpStatus.BAD_REQUEST)
        } else if (this.devices.get(device.uuid) !== undefined) {
            throw new HttpException('Device has already been enrolled.', HttpStatus.BAD_REQUEST)
        } else {
            this.devices.set(device.uuid, device)
            return device
        }
    
    }

    get(uuid: UUID): Device | undefined {
        return this.devices.get(uuid);
    }

/**
    update() {
    }

    delete() {
    }
*/

}
