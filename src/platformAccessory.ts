import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';
import process = require('node:child_process');
import gpio = require('rpi-gpio');

import { DakotaMotionSensorsPlatform } from './platform';

gpio.setMode(gpio.MODE_BCM);

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class DakotaMotionSensorAccessory {
  private service: Service;
  private pin: number;

  constructor(
    private readonly platform: DakotaMotionSensorsPlatform,
    private readonly accessory: PlatformAccessory,
  ) {

    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Dakota Alert, Inc.')
      .setCharacteristic(this.platform.Characteristic.Model, 'RE-4k Plus')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, 'unknown');

    // get the MotionSensor service if it exists, otherwise create a new service
    // you can create multiple services for each accessory
    this.service = this.accessory.getService(this.platform.Service.MotionSensor) ||
      this.accessory.addService(this.platform.Service.MotionSensor);

    // set the service name, this is what is displayed as the default name on the Home app
    // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.name);

    // each service must implement at-minimum the "required characteristics" for the given service type
    // see https://developers.homebridge.io/#/service/MotionSensor

    // register handler for the Active Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.StatusActive)
      .onGet(this.getActive.bind(this));

    // Updating characteristics values asynchronously.
    this.pin = accessory.context.device.pin;
    this.setUpPin();

    let previous = false;
    setInterval(() => {
      gpio.read(this.pin, (err: string, val: boolean) => {
        if (err) {
          this.platform.log.error('Failed to read GPIO pin', this.pin, err);
          this.setUpPin();
        } else {
          if (val !== previous) {
            this.service.updateCharacteristic(this.platform.Characteristic.MotionDetected, val);
          }
          previous = val;
        }
      });
    }, 1000);
  }

  private setUpPin() {
    this.platform.log.info('Setting up GPIO pin', this.pin);
    gpio.setup(this.pin, gpio.DIR_IN, gpio.EDGE_BOTH, (err: string) => {
      if (err) {
        this.platform.log.error('Failed to set up GPIO pin', this.pin, err);
      }
    });

    const python: string = (
      'import RPi.GPIO as GPIO; ' +
      'GPIO.setmode(GPIO.BCM); ' +
      `GPIO.setup(${this.pin}, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)`);
    const cmd = `python3 -c "${python}"`;
    process.exec(cmd, (err, output) => {
      if (err) {
        this.platform.log.error('Failed to set up GPIO pin', this.pin, err);
        this.platform.log.error(output);
      }
    });
  }

  /**
   * Handle "SET" requests from HomeKit
   * These are sent when the user changes the state of an accessory, for example, turning on a Light bulb.
   */

  /**
   * Handle the "GET" requests from HomeKit
   * These are sent when HomeKit wants to know the current state of the accessory, for example, checking if a Light bulb is on.
   *
   * GET requests should return as fast as possbile. A long delay here will result in
   * HomeKit being unresponsive and a bad user experience in general.
   *
   * If your device takes time to respond you should update the status of your device
   * asynchronously instead using the `updateCharacteristic` method instead.
   */
  async getActive(): Promise<CharacteristicValue> {
    // if you need to return an error to show the device as "Not Responding" in the Home app:
    // throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);
    return true;
  }
}
