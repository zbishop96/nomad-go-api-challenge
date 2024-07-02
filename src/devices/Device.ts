import { UUID } from 'crypto';

export class Device {
  id: UUID;
  latitude: number;
  longitude: number;
  apiKey: string;
}
