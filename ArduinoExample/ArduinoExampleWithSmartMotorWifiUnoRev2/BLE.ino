void BLESetup(const char* name) {
  // begin initialization
  if (!BLE.begin()) {
    Serial.println("starting BLE failed!");
    while (1)
      ;
  }


  BLE.setLocalName(name);     // set the local name peripheral advertises

  // set the UUID for the service this peripheral advertises:
  BLE.setAdvertisedService(arduinoBleService);

  // add the characteristics to the service
  for (int i = 0; i <= NoBLECharacteristics; i++) {
    arduinoBleService.addCharacteristic(characteristicList[i]);
  }
  // add the service
  BLE.addService(arduinoBleService);

  // start advertising
  BLE.advertise();

  Serial.println("Bluetooth device active, waiting for connections...");
}

void runBLE() {
  // listen for BLE peripherals to connect:
  BLEDevice central = BLE.central();
  // if a central is connected to peripheral:
  if (central) {
    Serial.print("Connected to central: ");
    // print the central MAC address:
    Serial.println(central.address());
    // while the central is still connected to peripheral:

    while (central.connected()) {
      // note: we will stay in this loop as long as we are connected via BLE!
      loopGPT();
    }
  }
  loopGPT();  // run everything here even if we are not connected
}