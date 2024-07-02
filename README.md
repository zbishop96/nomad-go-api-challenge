# NomadGo Back-end Coding Challenge

A weather monitoring system API that takes in temperature readings from devices and provides aggregated values.

## API Reference

#### Enroll a device

```
  POST /devices
```

| Property    | Type     | Description                                 |
| :---------- | :------- | :------------------------------------------ |
| `id`        | `string` | **Required**. A UUID identifying the device |
| `latitude`  | `number` | **Required**. A value between -90 and 90    |
| `longitude` | `number` | **Required**. A value between -180 and 180  |

#### Submit a temperature reading from a device

```
  POST /temperatures
```

| Parameter     | Type     | Description                                        |
| :------------ | :------- | :------------------------------------------------- |
| `deviceId`    | `string` | **Required**. A UUID identifying the device        |
| `temperature` | `number` | **Required**. The temperature reading in farenheit |

```
  GET /temperatures/daily
```

Provides the current day's high, low, and average temperatures.

```
  GET /temperatures/daily/{'high'|'low'|'average'}
```

Provides a specific aggregated value.

## Installation and Setup

This project was built with NestJS so Node will have to be installed with first. Installation instructions are here: https://nodejs.org/en/download/package-manager

I am using Node version 22.3.0 and npm version 10.8.1 in case you run into any compatability issues.

Once you have Node installed and have navigated to the root of the project, run the following:

```bash
  npm i
  npm run start
```

The API should now be running on `localhost:3000` but if that port is already in use you will need to free it up or specify another port by modifying `/src/main.ts`.

## Running Tests

To run tests, run the following command

```bash
  npm run test
```

## Usage/Examples

First, a device will need to be enrolled with the POST to `/devices`. The body should be formatted as:

```
{
    "id": "124a78d1-8fef-49cc-8d38-fec0da2fc3c0",
    "latitude":50,
    "longitude":50
}
```

Then, temperature readings can be submitted with the POST to `/temperatures` formatted as:

```
{
    "deviceId":"124a78d1-8fef-49cc-8d38-fec0da2fc3c0",
    "temperature":65
}
```

Finally, the aggregated values can be retrieved with the GET to either `temperatures/daily` or `temperatures/daily/{high | low | average}`. They are returned as a temperature object in the case of high and low:

```
{
    "id":"fc6a1f84-d262-40d2-a7d1-8616f9311cc7",
    "deviceId":"124a78d1-8fef-49cc-8d38-fec0da2fc3c0",
    "temperature":65,
    "dateTime":"2024-07-02T03:15:13.639Z"
}
```

and the average is returned as:

```
{
    "temperature": 65,
    "dateTime": "2024-07-02T03:15:13.639Z",
    "numReadings": 1
}
```
