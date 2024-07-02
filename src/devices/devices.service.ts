import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Device } from './Device';
import { CreateDeviceDto } from './CreateDeviceDto';
import { UUID, randomBytes, randomUUID, scrypt, timingSafeEqual } from 'crypto';

@Injectable()
export class DevicesService {

  private readonly devices: Map<UUID, Device> = new Map();

  async enroll(device: CreateDeviceDto): Promise<Device> {
    if (!/^[0-9A-Fa-f]{8}(-[0-9A-Fa-f]{4}){3}-[0-9A-Fa-f]{12}$/.test(device.id)) {
      throw new HttpException('Invalid id provided. ID must be a UUID.', HttpStatus.BAD_REQUEST);
    }

    if (device.latitude > 90 || device.latitude < -90 || device.longitude > 180 || device.longitude < -180) {
      throw new HttpException('Device latitude or longitude ranges are invalid. Latitude ranges from -90 to 90 and longitude ranges from -180 to 180.', HttpStatus.BAD_REQUEST)
    } else if (this.devices.get(device.id) !== undefined) {
      throw new HttpException('Device has already been enrolled.', HttpStatus.BAD_REQUEST)
    } else {
      const apiKey = randomUUID();
      const salt = randomBytes(16).toString("hex");
      const hash = await this.hashApiKey(apiKey, salt).then((x) => x.toString("hex"));
      await this.devices.set(device.id, {...device, apiKey: `${hash}.${salt}`})
      return {...device, apiKey: apiKey}
    }
  }

  get(uuid: UUID): Device | undefined {
      return this.devices.get(uuid);
  }

  async hashApiKey(key: string, salt: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      scrypt(
        key,
        salt,
        64,
        (err, hash) => {
          if (err) {
            reject(err);
          } else {
            resolve(hash);
          }
        });
    });
  }
    

  async compareKey(key: string, hashedKey: string) {
    const [originalHash, originalSalt] = hashedKey.split('.');
  
    if (!originalHash || !originalSalt) {
      throw Error("Invalid format for hashed password");
    }
  
    const originalHashBuffer = Buffer.from(originalHash, "hex");
    const generatedHashBuffer = await this.hashApiKey(key, originalSalt);
  
    return timingSafeEqual(originalHashBuffer, generatedHashBuffer);
  }


}
