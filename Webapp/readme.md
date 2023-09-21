# Web based ChatGPT-Arduino Interface

Connect ChatGPT to the physical world!

This project enables you to connect ChatGPT with an Arduino using Bluetooth Low Energy (BLE). In the future we may add other options for connections like Serial and MQTT. The code runs in a web app using the BLE Web API, which works in the Chrome browser.

## About

The ChatGPT-Arduino Bluetooth Interface project aims to bridge the communication gap between ChatGPT, a powerful language model, and Arduino, a versatile microcontroller. By using BLE, you can control your Arduino projects using natural language input through a web app. 

## Features

- **ChatGPT Integration:** Connects ChatGPT with an Arduino, enabling you to send commands and receive responses via BLE.

- **Web App Interface:** The project includes a web app that you can access using the Chrome browser. The web app communicates with the Arduino through the BLE Web API.

## Prerequisites

Before you begin, ensure you have the following:

- Google Chrome browser (required for accessing the BLE Web API)

- An Arduino board that supports BLE (e.g., Arduino Wifi uno rev 2)

## Installation

1. Clone this repository to your local machine.
2.1 add the file chatGPTkey.js to your /js folder
2.2 `const OPENAI_API_KEY = 'your api key here'; // never share this or publish online!`
2. Upload the example code to the Arduino
3. Run the webapp on a [local web server.](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
4. Always ask ChatGPT to connect to the remote device first
5. Change the bevahour of chatGPT by editing the params.js file

## Arduino

Currently the ArduinoBLE library is extremely bloated. We have have good experience using version 1.1.1 which is fairly light, together with the wifiNina firmware version 1.5. 

1. Update your [firmware for the wifiNina to 1.5](https://support.arduino.cc/hc/en-us/articles/360013896579-Update-the-firmware-for-WiFiNINA-and-WiFi101) 
2. Upload the example code to the Arduino
