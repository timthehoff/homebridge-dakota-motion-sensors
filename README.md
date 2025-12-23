# Homebridge Dakota Motion Sensors

Homebridge plugin to integrate Dakota Motion Sensors into Homebridge/HomeKit.

## Features

- Exposes one or more Dakota motion sensors as HomeKit motion sensors.
- Triggers motion sensor accessories through Dakota Alert relay signals.

## Installation

Install the plugin into your Homebridge environment:

```bash
npm install -g homebridge-dakota-motion-sensors
# or inside your Homebridge UI/system:
npm install --save homebridge-dakota-motion-sensors
```

## Configuration

Add the platform to your Homebridge `config.json` under `platforms`. Example:

```json
"platforms": [
	{
		"platform": "DakotaMotionSensors",
		"sensors": [
			{
				"name": "Living Room Motion",
				"pin": 4
			}
		]
	}
]
```

See the plugin `config.schema.json` for available configuration keys and validation: [config.schema.json](config.schema.json)

## Usage

- After installing and configuring, restart Homebridge. The Dakota sensors will appear in HomeKit with the names you provided.
- Motion events are reported by the plugin based on sensor updates.

## Development

A Raspbian devcontainer is provided or work can be done directly on the Homebridge host.

### Install Dependencies

```
npm install
```

### Build Plugin

```
npm run build
```

### Link To Homebridge

If running on Homebridge host:

```
npm link
```
