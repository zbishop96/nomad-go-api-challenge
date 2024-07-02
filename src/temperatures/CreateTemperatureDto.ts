import { UUID } from 'crypto';

export class CreateTemperatureDto {
  deviceId: UUID;
  temperature: number;
}
