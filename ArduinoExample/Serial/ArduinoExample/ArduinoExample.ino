#include <Arduino.h>

#ifdef ARDUINO_AVR_UNO_WIFI_REV2
#include <Arduino_LSM6DS3.h>  // the IMU used on the Uno Wifi rev 2
#endif


// Variables
bool ledState = false;
float motorPosition = 0.0;
int motorSpeed = 0;
int imuValue = 0;
unsigned long previousMillisShake = 0;  // This is used to keep track of notify frequencies
String storedString = "";

void setup() {
  Serial.begin(9600);
  pinMode(LED_BUILTIN, OUTPUT);

#ifdef ARDUINO_AVR_UNO_WIFI_REV2
  if (!IMU.begin()) {
    Serial.println("Failed to initialize IMU!");
    while (1)
      ;
  }
#endif
}

void loop() {
  unsigned long currentMillis = millis();  // we will use this to keep track of notify frequency
  if (Serial.available() > 0) {
    String command = Serial.readStringUntil('\n');
    processCommand(command);
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
  // Add code to set motor position
}

void set_motor_speed(int speed) {
  motorSpeed = speed;
  // Add code to set motor speed
}

int get_IMU() {
  // Add code to read IMU value
  notify("get_IMU", imuValue);
}

void set_String(String str) {
  storedString = str;
}


struct Command {
  String name;
  String dataType;
  void (*funcBool)(bool);
  void (*funcInt)(int);
  void (*funcFloat)(float);
  void (*funcString)(String);
};

Command commandFunctions[] = {
  { "set_LED", "bool", set_LED},
  { "get_LED", "bool", get_LED},
  { "set_motor_position", "float", },
  { "set_motor_speed", "int", set_motor_speed},
  { "get_IMU", "int", get_IMU},
  { "set_String", "string", set_String}
};
