import { UUID } from "crypto";

export class CreateDeviceDto {
    id: UUID
    latitude: number
    longitude: number
}