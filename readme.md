# Web based ChatGPT-Arduino Interface

Connect ChatGPT to the physical world!

This project enables you to connect ChatGPT with an Arduino using Bluetooth Low Energy (BLE) via a webapp in a Chrome browser. In the future we may add other options for connections like Serial and MQTT.

The web app needs to stay open while using the device. This has the advantage of providing a simple interface for talking to chatgpt and testing quick prototypes. If you need something to work on Arduino independently of a desktop computer, try this [ChatGPT client for Arduino](https://github.com/0015/ChatGPT_Client_For_Arduino), or this [Arduino Cloud example](https://projecthub.arduino.cc/dbeamonte_arduino/chat-with-chatgpt-through-arduino-iot-cloud-6b4ef0).


## Features

- **ChatGPT Integration:** Connects ChatGPT with an Arduino, enabling you to send commands and receive responses via BLE.

- **Web App Interface:** The project includes a web app that you can access using the Chrome browser. The web app communicates with the Arduino through the BLE Web API. The app is built with vanilla JS and requires no compiling to run. 

## Prerequisites

Before you begin, ensure you have the following:

- Google Chrome browser (required for accessing the BLE Web API)

- An Arduino board that supports BLE (e.g., Arduino Wifi uno rev 2)

## Installation

1. Clone this repository to your local machine, and run the web app on a local server. 
2. Flash the Arduino example to a BLE enabled board using the Arduino IDE. (see more information below)

## Web app. 

You'll need to set up a couple of things up before the web app will work, and you will need a chatGPT API key.

1. Create a file called "chatGPTkey.js" in the /js directory of the webapp. Inside this file, add the line: 
```
const OPENAI_API_KEY = 'PUT YOUR API KEY HERE'; // never share this or publish online!
```
2. Run the webapp on a local or live web server.
3. Open the webapp in Chrome and ask ChatGPT to connect to the remote device.
4. ChatGPT is now connected to the physical world! 

Next you will want to modify the example to give ChatGPT a unique personality or rules to control its behaviour. Check out the [best practice guide in the API documentation](https://platform.openai.com/docs/guides/gpt-best-practices/strategy-write-clear-instructions) for more tips. 

1. Open the params.js file
2. Change the system text to modify the behaviour of the chatbot. 
3. Each request to the API send all of the system instructions and message history, so keep the length of instructions to minimal to [avoid exceeding the token quota](https://openai.com/pricing). 

## Arduino

Currently the ArduinoBLE library is extremely bloated. We have have good experience using version 1.1.1 which is fairly light, together with the wifiNina firmware version 1.5. 

1. Update your [firmware for the wifiNina to 1.5](https://support.arduino.cc/hc/en-us/articles/360013896579-Update-the-firmware-for-WiFiNINA-and-WiFi101) 
2. Upload the example code to the Arduino. 
3. Modify the example for your own project: most of your code should be in loopGPT, which will be called when BLE is connected. 


## How it works

The whole process is based on the "function calling" feature of the ChatGPT api. In response to a prompt, the API can either send you a message or call to a predefined function. If the API sends a function call, it expects to get a response with the return value from the function. It then uses this response to formulate a new message, or to decide to make additional function calls. 

The web app handles the routing of these function calls to the Arduino connected via BLE. In addition, you can program events on the arduino using BLE notify to send information to chatGPT without any user intervention in the web app. You can see these communications taking place via the the web app, which needs to stay open. 

## BLE notify events

The Arduino can talk directly to chatGPT without anything needed to be typed in the web app. This works by declaring a BLE Characteristic with "Notify" on, and listing the characteristic in BLENotify section of Params.js. 

A BLE characteristic is simply a data item which is exposed over BLE to readable and/or writable from an other device. The browser will subscribe to any characteristic listed in Params.js, and if there is a an event it will relay the information to chatGPT. 

Be careful how often these events are fired. It will take ChatGPT a couple of seconds to respond to each event, so you don't want to be firing this events very frequently.  

``` csharp 
    int sensorValue = analogRead(A0);
    if (sensorValue >= 500) {
      sensorCharacteristic.writeValue(sensorValue);  
      Serial.println("sensorValue notify!");
      delay(2000); //  delay here to prevent event happening too often.
    } 
```
A delay like this is simple and will work, but it blocks your arduino code for 2 whole seconds!

A better option looks like this:

```csharp
unsigned long previousMillis = 0;  

void loopGPT() {
  unsigned long currentMillis = millis();
  int sensorValue = analogRead(A0);
if (sensorValue >= 500 && currentMillis - previousMillis >= 2000) {
      sensorCharacteristic.writeValue(sensorValue);  
      Serial.println("sensorValue notify!");
      previousMillis = currentMillis
  } 
}
```


