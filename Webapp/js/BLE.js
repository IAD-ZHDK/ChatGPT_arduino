
let bleConnected = false;
let myCharacteristics = [];

function handleNotifications(event) {
    // this is setup for getting IMU data from the arduino 
    console.log(" 🎉 🎊 event! 🎉 🎊 ")
    let value = event.target.value;
    let notifyObject = BLENotify.find(notifyObj => notifyObj.uuid === event.currentTarget.uuid);
    if (notifyObject != null) {
        // there is a matching characteristics in the BLENotify list
        let oldValue = notifyObject.value;
        if (notifyObject.type == "boolean") {
            notifyObject.value = value.getUint8();
        } else if (notifyObject.type == "int") {
            notifyObject.value = value.getInt32(0, true);
        }
        let updateObject = {
            description: notifyObject.info,
            value: notifyObject.value,
            type: notifyObject.type,
        }
        // handle boolean events
        if (notifyObject.type == "boolean" && notifyObject.checkOn != "change") {
                if (oldValue < notifyObject.value && notifyObject.checkOn == "rise") {
                    // rising
                    console.log("value rising")
                    submitPrompt(JSON.stringify(updateObject), "system");
                } else if (oldValue > notifyObject.value && notifyObject.checkOn == "fall") {
                    //falling
                    console.log("value falling")
                    submitPrompt(JSON.stringify(updateObject), "system");
                }
        } else {
            console.log("value change")
            submitPrompt(JSON.stringify(updateObject), "system");
        }
    }
}

function onDisconnected(event) {
    // Object event.target is Bluetooth Device getting disconnected.
    console.log('> Bluetooth Device disconnected'+event);
    let updateObject = {
        description: "disconnected from BLE device",
    }
    bleConnected = false;
    // functionHandler.autoConnect()
    submitPrompt(JSON.stringify(updateObject), "system");
  }

const functionHandler = {
    checkConection() {
        return new Promise(function (resolve, reject) {
            let returnObject = {
                description: "BLE connection",
                value: bleConnected,
            }
            resolve(returnObject);
        })
    },


    connectToDevice() {
        return new Promise(function (resolve, reject) {
            console.log('Requesting Bluetooth Device...');
            if (navigator.bluetooth == undefined) {
                let returnObject = {
                    description: "Error",
                    value: "BLE does not appear to be accessible in your browser. Try using Chrome",
                }
                resolve(returnObject);
            }
            navigator.bluetooth.requestDevice({
                filters: [{
                    services: [serviceUuid]
                }]
            })
                .then(device => {
                    console.log('Connecting to GATT Server...');
                    device.addEventListener('gattserverdisconnected', onDisconnected);
                    return device.gatt.connect();
                })
                .then(server => {
                    console.log('Getting Service...');
                    return server.getPrimaryService(serviceUuid);
                })
                .then(service => {
                    bleConnected = true;
                    console.log('Getting all Characteristics...');
                    return service.getCharacteristics();
                })
                .then(characteristics => {
                    myCharacteristics = []; // clear the array incase we have attempted to connect before
                    for (const c in characteristics) {
                        myCharacteristics.push(characteristics[c]);
                        try {
                            if (characteristics[c].properties.notify) {
                                characteristics[c].startNotifications().then(_ => {
                                    characteristics[c].addEventListener('characteristicvaluechanged', handleNotifications);
                              
                                    // this characteristics is setup for notifications
                                    console.log('Getting notifications started on: ' + characteristics[c].uuid);
                                });
                            }
                        } catch (e) {
                            console.log(e);
                        }
                        console.log("characteristics" + c + " :");
                        console.log(characteristics[c]);
                    }
                    let returnObject = {
                        description: "BLE connection",
                        value: bleConnected,
                    }
                    resolve(returnObject);
                })
                .catch(error => {
                    let returnObject = {
                        description: "Error",
                        value: error,
                    }
                    resolve(returnObject);
                });

        })
    },

    write_to_Device(object) {
        let returnObject = {
            description: "Writing to Characteristic",
            value: "",
        }
        return new Promise(function (resolve, reject) {
            // if (object.uuid && object.value) {
            let characteristic = myCharacteristics.find(characteristic => characteristic.uuid === object.uuid);
            console.log("writing to device:");
            if (characteristic != null) {
                let bufferToSend;
                 if (object.dataType == "boolean")  { 
                    console.log("boolean")
                    bufferToSend = Int8Array.of(object.value); 
                } else if (object.dataType == "integer" || typeof object.value == "int")  { 
                    console.log("int")
                    bufferToSend = Int32Array.of(object.value); 
                } else if ( object.dataType  == "number")  { 
                    console.log("float")
                    bufferToSend = Float32Array.of(object.value); 
                } else {
                    // treat everything else as a string
                    console.log("string")
                    bufferToSend = str2ab(object.value); // assume it's a sting and convert it to an arraybuffer 
                } 
                characteristic.writeValueWithResponse(bufferToSend)
                    .then(_ => {
                        console.log(' > uuid ' + object.uuid);
                        console.log(' > value ' + object.value);
                        console.log(' > value changed to: ');
                        console.log(' > '+bufferToSend);
                        returnObject.value = "success!"
                        resolve(returnObject);
                    })
                    .catch(error => {
                        console.log('Argh! ' + error);
                        returnObject.value = error;
                        resolve(returnObject);
                    });
            } else {
                returnObject.value = "error: characteristic is not defined";
                resolve(returnObject);
            }
        })
    },

    get_device_property(object) {
        let returnObject = {
            description: "reading characteristic",
            value: "",
        }
        return new Promise(function (resolve, reject) {
            console.log("readCharacteristic");
            if (object.uuid) {
                let uuid = object.uuid;
                console.log(uuid);
                let characteristic = myCharacteristics.find(characteristic => characteristic.uuid === uuid);
                console.log(uuid);
                console.log(characteristic);
                if (characteristic != null) {

                    characteristic.readValue().then(value => {
                        console.log("value");
                        console.log(value);

                      let incomingValue = 0;
                        console.log(' > uuid ' + uuid);
                        console.log(' > value ' + incomingValue);

                        if (object.dataType == "boolean")  { 
                            incomingValue = value.getInt8();
                        } else if (object.dataType == "integer" || typeof object.value == "int")  { 
                            incomingValue = value.getInt32();
                        } else if ( object.dataType  == "number")  { 
                        // treat everything else as a float
                            incomingValue = value.getFloat32()
                        } 
                        returnObject.value = incomingValue;
                        resolve(returnObject);
                    }).catch(error => {
                        returnObject.description = "Error";
                        returnObject.value = error;
                        resolve(returnObject);
                    });
                } else {
                    returnObject.description = "Error";
                    returnObject.value = "characteristic is not defined";
                    resolve(returnObject);
                }
            } else {
                returnObject.description = "Error";
                returnObject.value = "missing object uuid";
                resolve(returnObject);
            }
        })
    },
};

function str2ab(str) {
    // converts string to array object
    var buf = new ArrayBuffer(str.length);
    var bufView = new Uint8Array(buf);
    for (var i=0, strLen=str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
    }
    return buf;
};
