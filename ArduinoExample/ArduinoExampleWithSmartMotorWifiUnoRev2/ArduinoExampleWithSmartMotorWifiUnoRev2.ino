#include <ArduinoBLE.h>
#include <SoftwareSerial.h>
#include <SPI.h>           // SPI library
#include <SdFat.h>         // SDFat Library
//#include <SdFatUtil.h>     // SDFat Util Library
#include <SFEMP3Shield.h>  // Mp3 Shield Library


#define rxPin 8
#define txPin 9
SoftwareSerial mySerial(rxPin, txPin);  // Create the new software serial instance

BLEService arduinoBleService("19B10000-E8F2-537E-4F6C-D104768A1214");  // create service

// create characteristics and allow remote device to read and write
BLEBoolCharacteristic LEDCharacteristic("19B10001-E8F2-537E-4F6C-D104768A1214", BLERead | BLEWrite);
BLEFloatCharacteristic motorDegreesCharacteristic("19B10012-E8F2-537E-4F6C-D104768A1214", BLEWrite);
BLEIntCharacteristic motorSpeedCharacteristic("19B10019-E8F2-537E-4F6C-D104768A1214", BLEWrite);

byte NoBLECharacteristics = 3;  // this needs to match your total number of Characteristics
// you need to add all your Characteristics to the following array:
BLECharacteristic characteristicList[] = { LEDCharacteristic, motorDegreesCharacteristic, motorSpeedCharacteristic};

unsigned long previousMillisShake = 0;  // This is used to keep track of notify frequencies



void setup() {
  Serial.begin(9600);
  delay(100);
  BLESetup("arduinoChaTGPT");  // Don't remove this line!
  pinMode(LED_BUILTIN, OUTPUT);

  mySerial.begin(115200); // Important! this is the standard speed for talking to LSS
  mySerial.print("#0D1500\r");  // this is used to clear the serial buffer
}

void loop() {
  runBLE();  // Don't remove this line!
}

void loopGPT() {                           // this will run in a constant loop
  unsigned long currentMillis = millis();  // we will use this to keep track of notify frequency

  if (LEDCharacteristic.written()) {
    // set the led on or off
    bool newValue = LEDCharacteristic.value();
    Serial.print("LED : ");
    Serial.println(newValue);
    digitalWrite(LED_BUILTIN, newValue);
  }

  if (stringCharacteristic.written()) {
    // recieve a string and send it to terminal
    byte length = stringCharacteristic.valueLength();
    String newValue = String((char *)stringCharacteristic.value()).substring(0, length); // this is to work around a bug in the ble library, where value() returns chunk at the end of the string
    Serial.print("string : ");
    Serial.println(newValue);
    Serial.print("length: ");
    Serial.println(length);
  }

  if (motorDegreesCharacteristic.written()) {
    float degrees = motorDegreesCharacteristic.value(); // this is to work around a bug in the ble library, where value() returns chunk at the end of the string
    int intdegrees = floor(degrees*10); // convert to 10ths of degrees and round down
      Serial.print("motor float: ");
      Serial.print(degrees);
    Serial.print("motor degrees: ");
    Serial.println(intdegrees);
    mySerial.print(String("#") + 254 + String("D") + intdegrees  + "\r"); // move degrees
  }
  if (motorSpeedCharacteristic.written()) {
    int rpm = motorSpeedCharacteristic.value(); // this is to work around a bug in the ble library, where value() returns chunk at the end of the string
    Serial.print("motor RPM : ");
    Serial.println(rpm);
    mySerial.print(String("#") + 254 + String("WR") + rpm  + "\r"); // move degrees
  }
}
