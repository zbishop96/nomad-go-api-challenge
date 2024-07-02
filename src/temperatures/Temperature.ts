import { UUID } from 'crypto';

export class Temperature {
  id: UUID;
  deviceId: UUID;
  temperature: number;
  dateTime: Date;
}
