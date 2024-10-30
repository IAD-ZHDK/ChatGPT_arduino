#include <Arduino.h>
#include <SoftwareSerial.h>
#ifdef ARDUINO_AVR_UNO_WIFI_REV2
#include <Arduino_LSM6DS3.h>  // the IMU used on the Uno Wifi rev 2
#endif

// Smart Servo Variables
#define rxPin 8
#define txPin 9
SoftwareSerial myServoSerial(rxPin, txPin);  // Create the new software serial instance
#define LSS_ID 254 // ID 254 to broadcast to every motor on bus

#include "SerialChatGPT.h"

// Variables
bool ledState = false;
float motorPosition = 0.0;
int motorSpeed = 0;
int imuValue = 5;
unsigned long previousMillisShake = 0;  // This is used to keep track of notify frequencies
String storedString = "bas";

void setup() {
  Serial.begin(115200); // don't change the baud rate!
  pinMode(LED_BUILTIN, OUTPUT);

#ifdef ARDUINO_AVR_UNO_WIFI_REV2
  if (!IMU.begin()) {
    Serial.println("Failed to initialize IMU!");
    while (1)
      ;
  }
#endif
  // set up smart servo 
  myServoSerial.begin(115200);
  myServoSerial.print("#0D1500\r");  // this is used to clear the serial buffer
  myServoSerial.print(String("#") + LSS_ID + String("LED") + 6 + "\r"); // set LED
}

void loop() {
  unsigned long currentMillis = millis();  // we will use this to keep track of notify frequency
  if (Serial.available() > 0) {
    String command = Serial.readStringUntil('\n');
    processCommand(command);
  }
    
  // remove this
  if (analogRead(A0)>= 1000 && currentMillis - previousMillisShake >= 2000) {
       notify("press", true);
      previousMillisShake = currentMillis;
  }

#ifdef ARDUINO_AVR_UNO_WIFI_REV2
  // code for making the IMU data available over bluetooth
  if (IMU.accelerationAvailable()) {
    float acceleration[3];
    // x, y, z
    IMU.readAcceleration(acceleration[0], acceleration[1], acceleration[2]);
    float value = acceleration[0];
    value = value * 10000;
    imuValue = int(value);
    // check if the device is shaken, and make it available over BLE
    if (abs(acceleration[0]) > 2.0 || abs(acceleration[1]) > 2.0 || abs(acceleration[2]) > 2.0) {
      if (currentMillis - previousMillisShake >= 2000) {  // only allow notfications maximum every 2 seconds
                                                          // high G value indicates a shake event
        notify("shake", true);
        previousMillisShake = currentMillis;
      }
    }
  }
#endif
}

void set_LED(bool state) {
  ledState = state;
  digitalWrite(LED_BUILTIN, state ? HIGH : LOW);
}

void get_LED() {
  notify("get_LED", ledState);
}

void set_motor_position(float position) {
  motorPosition = position;
  myServoSerial.print(String("#") + LSS_ID + String("D") + int(motorPosition*10)  + "\r"); // move 100 degrees
  // Add code to set motor position
}             

void get_motor_position() {
    notify("get_motor_position", motorPosition);
  // Add code to set motor position
}             

void set_motor_speed(int speed) {
  motorSpeed = speed;
  myServoSerial.print(String("#") + LSS_ID + String("WR") + motorSpeed  + "\r"); // RPM move
  // Add code to set motor speed
}

void get_IMU() {
  notify("get_IMU", imuValue);
}

void set_String(String str) {
  storedString = str;
}

void get_String() {
  notify("get_String", storedString);
}
                                
// {"function_name", "writeDataType", function}
Command commandFunctions[] = {
  { "set_LED", "bool", set_LED},
  { "get_LED", "none", get_LED},
  { "set_motor_position", "float", set_motor_position},
  { "set_motor_speed", "int", set_motor_speed},
  { "get_motor_position", "none", get_motor_position},
  { "get_IMU", "none", get_IMU},
  { "set_String", "string", set_String},
  { "get_String", "none", get_String}
};

// Define the number of commands
const int numCommands = sizeof(commandFunctions) / sizeof(commandFunctions[0]);
