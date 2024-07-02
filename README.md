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

#### Retrieve all aggregate values for the current day

```
  GET /temperatures/daily
```
#### Retrieve a specific aggregate value for the current day

```
  GET /temperatures/daily/{'high'|'low'|'average'}
```



## Installation and Setup

This project was built with NestJS so Node will have to be installed with first. Installation instructions are here: https://nodejs.org/en/download/package-manager

I am using Node version 22.3.0 and npm version 10.8.1 in case you run into any compatability issues.

Once you have Node installed and have navigated to the root of the project, run the following:

```
  npm i
  npm run start
```

The API should now be running on `localhost:3000` but if that port is already in use you will need to free it up or specify another port by modifying `/src/main.ts`.

## Running Tests

To run tests, run the following command

```
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

The response will include the raw API key and that will be the only time it is available. If authentication guards were in place (see design notes), this key would be required as a bearer token in the authentication header on requests for anything other than enrolling new devices. Then, temperature readings can be submitted with the POST to `/temperatures` formatted as:

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

## Design Choice Notes

I chose to use NestJS for this as it is more backend / API oriented than NextJS. In a production setting I would've used a relational database like Postgres, but here for the sake of simplicity in config / install I've used an in-memory datastore. The in memory store for devices is a map indexed by `id` to ensure quick lookup when determining if a temperature can bet submitted.

In enrolling devices I opted to return the raw API key and store the hash with the device info. However, I decided to omit the authorization guards as this was a point discussed in the design question and potentially interferes with any automated testing. I've also omitted a rate-limiting guard as it seemed out of scope but was mentioned in the design question.

I've implemented an in-memory cache as well which in conjunction with the in-memory datastore doesn't do much to speed things up but acts as a proof of concept. It contains the daily high, low, and average. When a new temperature reading is submitted that is a calendar day in the future or greater, they overwrite the cache. I've based it on calendar day so it is a true daily aggregate and not a rolling aggregate of the last 24 hours.

Another omission was the use of Zod. Zod is a schema validation package that effectively allows you to do runtime type checking. While incredibly useful, a project this small wouldn't benefit from it enough for the effort required.
