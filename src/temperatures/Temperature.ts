import { UUID } from "crypto";

export class Temperature {
    uuid: UUID
    deviceUuid: UUID
    temperature: number
    dateTime: Date
}