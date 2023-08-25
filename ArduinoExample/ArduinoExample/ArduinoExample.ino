#include <ArduinoBLE.h>
#include <Arduino_LSM6DS3.h>  // the IMU used on the Uno Wifi rev 2

BLEService arduinoBleService("19B10000-E8F2-537E-4F6C-D104768A1214");  // create service

// create characteristics and allow remote device to read and write
BLEBoolCharacteristic LEDCharacteristic("19B10001-E8F2-537E-4F6C-D104768A1214", BLERead | BLEWrite);
BLECharacteristic accelerationCharacteristic("19B10014-E8F2-537E-4F6C-D104768A1214", BLERead, sizeof(int32_t));
BLEBoolCharacteristic shakeCharacteristic("19B10016-E8F2-537E-4F6C-D104768A1214", BLENotify);

byte NoBLECharacteristics = 3;  // this needs to match your total number of Characteristics
// you need to add all your Characteristics to the following array:
BLECharacteristic characteristicList[] = { LEDCharacteristic, accelerationCharacteristic, shakeCharacteristic};


void setup() {
  Serial.begin(9600);
  delay(100);
  BLESetup();
  pinMode(LED_BUILTIN, OUTPUT);
}

void loop() {
  runBLE();
}

void loop2() {
  // this will run in a constant loop
  if (LEDCharacteristic.written()) {
    bool newValue;
    newValue = LEDCharacteristic.value();
    Serial.print("LED : ");
    Serial.println(newValue);
    digitalWrite(LED_BUILTIN, newValue);
  }
  // code for making the IMU data available over bluetooth
  if (IMU.accelerationAvailable()) {
    float acceleration[3];
    // x, y, z
    IMU.readAcceleration(acceleration[0], acceleration[1], acceleration[2]);
    float value = acceleration[0];
    value = value * 10000;
    Serial.println(acceleration[0]);
    accelerationCharacteristic.writeValue(int32_t(value));  // we just write the X value to this characteristi

    // check if the device is shaken, and make it available over BLE
    if (abs(acceleration[0]) > 2.0 || abs(acceleration[1]) > 2.0 || abs(acceleration[2]) > 2.0) {
      // high G value indicates a shake event
      shakeCharacteristic.writeValue(true);  // we just write the X value to this characteristi
      Serial.println("shake!");
      delay(500);
    } else {
      // if shakeCharacteristics value is true, set it back to false
      bool shakeValue = shakeCharacteristic.value();
      if (shakeValue == true) {
        shakeCharacteristic.writeValue(false);
      }
    }
  }
}
