#include <ArduinoBLE.h>
#include <Arduino_LSM6DS3.h>  // the IMU used on the Uno Wifi rev 2
#define potiPin A0

BLEService arduinoBleService("19B10000-E8F2-537E-4F6C-D104768A1214");  // create service

// create characteristics and allow remote device to read and write
BLEBoolCharacteristic LEDCharacteristic("19B10001-E8F2-537E-4F6C-D104768A1214", BLERead | BLEWrite);
BLECharacteristic intCharacteristic("19B10002-E8F2-537E-4F6C-D104768A1214", BLERead | BLEWrite, sizeof(int32_t));
BLECharacteristic accelerationCharacteristic("19B10014-E8F2-537E-4F6C-D104768A1214", BLERead, sizeof(int32_t));
BLECharacteristic stringCharacteristic("19B10018-E8F2-537E-4F6C-D104768A1214", BLEWrite, sizeof(int8_t) * 32);  // this is the maxium length of 32 bytes
BLEBoolCharacteristic shakeCharacteristic("19B10016-E8F2-537E-4F6C-D104768A1214", BLENotify);
BLECharacteristic potiCharacteristic("19b10036-e8f2-537e-4f6c-d104768a1214", BLENotify, sizeof(int32_t));

byte NoBLECharacteristics = 5;  // this needs to match your total number of Characteristics
// you need to add all your Characteristics to the following array:
BLECharacteristic characteristicList[] = { LEDCharacteristic, accelerationCharacteristic, shakeCharacteristic, stringCharacteristic };

                                                                         
int potiValue = 0;
unsigned long previousMillisPoti = 0;  // This is used to keep track of notify frequencies

unsigned long previousMillisShake = 0;




void setup() {
  Serial.begin(9600);
  delay(100);
  BLESetup("arduinoChaTGPT");  // Don't remove this line!
  if (!IMU.begin()) {
    Serial.println("Failed to initialize IMU!");
    while (1)
      ;
  }
  pinMode(LED_BUILTIN, OUTPUT);
}

void loop() {
  runBLE();  // Don't remove this line!
}

void loopGPT() {                           // this will run in a constant loop
  unsigned long currentMillis = millis();  // we will use this to keep track of notify frequency

  if (LEDCharacteristic.written()) {
    bool newValue = LEDCharacteristic.value();
    Serial.print("LED : ");
    Serial.println(newValue);
    digitalWrite(LED_BUILTIN, newValue);
  }

  if (stringCharacteristic.written()) {
    byte length = stringCharacteristic.valueLength();
    String newValue = String((char *)stringCharacteristic.value()).substring(0, length);  // this is to work around a bug in the ble library, where value() returns chunk at the end of the string
    Serial.print("string : ");
    Serial.println(newValue);
    Serial.print("length: ");
    Serial.println(length);
  }
  // code for making the IMU data available over bluetooth
  if (IMU.accelerationAvailable()) {
    float acceleration[3];
    // x, y, z
    IMU.readAcceleration(acceleration[0], acceleration[1], acceleration[2]);
    float value = acceleration[0];
    value = value * 10000;
    // Serial.println(acceleration[0]);
    accelerationCharacteristic.writeValue(int32_t(value));  // we just write the X value to this characteristic
    // check if the device is shaken, and make it available over BLE
    if (abs(acceleration[0]) > 2.0 || abs(acceleration[1]) > 2.0 || abs(acceleration[2]) > 2.0) {
      if (currentMillis - previousMillisShake >= 2000) { // only allow notfications maximum every 2 seconds
        // high G value indicates a shake event
        shakeCharacteristic.writeValue(true);
        Serial.println("shake!");
        previousMillisShake = currentMillis;
      }
    } else {
      // if shakeCharacteristics value is true, set it back to false
      bool shakeValue = shakeCharacteristic.value();
      if (shakeValue == true) {
        shakeCharacteristic.writeValue(false);
      }
    }
  }
  // code for making the Poti value available over bluetooth
  /*
  int newPotiValue = analogRead(potiPin);
  if (newPotiValue > potiValue + 15 || newPotiValue < potiValue - 15) {  // it has too have have a minimal change any direction
    if (currentMillis - previousMillisPoti >= 2000) { // only allow notfications maximum every 2 seconds
      potiValue = newPotiValue;
      potiCharacteristic.writeValue(int32_t(potiValue));
      Serial.print("potiValue: ");
      Serial.println(potiValue);
      previousMillisPoti = currentMillis;
    }
  }
  */
}
