import ICommunicationMethod from './ICommunicationMethod.js';

class BLECommunication extends ICommunicationMethod {

    constructor() {
        super();
        this.bleConnected = false;
        this.myCharacteristics = [];
        // Other initializations
        this.onDisconnected = this.onDisconnected.bind(this);
        this.connect = this.connect.bind(this);
    }

    receive(event) {
        console.log(" 🎉 🎊 event! 🎉 🎊 ")
        let value = event.target.value;
        let notifyObject = Notify.find(notifyObj => notifyObj.uuid === event.currentTarget.uuid);
        if (notifyObject != null) {
            // there is a matching myCharacteristics in the Notify list
            let oldValue = notifyObject.value;
            if (notifyObject.type == "boolean") {
                  console.log("boolean")
                notifyObject.value = value.getUint8();
            } else if (notifyObject.type == "int") {
                console.log("int")
                // Check if the DataView has enough bytes to read an Int32
                if (value.byteLength >= 4) {
                    notifyObject.value = value.getInt32(0, true);
                } else {
                    console.error("DataView does not contain enough bytes to read an Int32");
                    return;
                }
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
                    // todo:improve the handling of notifcations 
                    this.submitPrompt(JSON.stringify(updateObject), "system");
                } else if (oldValue > notifyObject.value && notifyObject.checkOn == "fall") {
                    //falling
                    console.log("value falling")
                    // todo:improve the handling of notifcations 
                   this.submitPrompt(JSON.stringify(updateObject), "system");
                }
            } else {
                console.log("value change")
                           // todo:improve the handling of notifcations 
               this.submitPrompt(JSON.stringify(updateObject), "system");
            }
        }
    }


    checkConection() {
        return new Promise((resolve, reject) => {
            let returnObject = {
                description: "BLE connection",
                value: this.bleConnected,
            }
            resolve(returnObject);
        })
    }

    onDisconnected(event) {
        // Object event.target is Bluetooth Device getting disconnected.
        console.log('> Bluetooth Device disconnected' + event);
        let updateObject = {
            description: "disconnected from BLE device",
        }
        this.bleConnected = false;
            this.submitPrompt(JSON.stringify(updateObject), "system");
    }
    connect(data) {
        return new Promise((resolve, reject) => {
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
                    if (device && device.gatt) {
                        console.log('adding disconnect handler');
                        //device.addEventListener('gattserverdisconnected', this.onDisconnected);
                    } else {
                        console.error('Device or device.gatt is undefined');
                    }
                    return device.gatt.connect();
                })
                .then(server => {
                    console.log('Getting Service...');
                    return server.getPrimaryService(serviceUuid);
                })
                .then(service => {
                    this.bleConnected = true;
                    console.log('Getting all Characteristics...');
                    return service.getCharacteristics();
                })
                .then(characteristics => {
                    console.log('characteristics found: ' + characteristics.length);
                    this.myCharacteristics = []; // clear the array incase we have attempted to connect before
                    for (const c in characteristics) {
                        this.myCharacteristics.push(characteristics[c]);
                        try {
                            if (characteristics[c].properties.notify) {
                                characteristics[c].startNotifications().then(_ => {
                                    characteristics[c].addEventListener('characteristicvaluechanged', this.receive);
    
                                    // this myCharacteristics is setup for notifications
                                    console.log('Getting notifications started on: ' + characteristics[c].uuid);
                                });
                            }
                        } catch (e) {
                            console.log(e);
                        }
                        console.log("myCharacteristics" + c + " :");
                        console.log(characteristics[c]);
                    }
                    let returnObject = {
                        description: "BLE connection",
                        value: this.bleConnected,
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
    }
    write(object) {
        let returnObject = {
            description: "Writing to Characteristic",
            value: "",
        }
        return new Promise((resolve) => {
            // if (object.uuid && object.value) {
            let characteristic = null;
            try {
                characteristic = this.myCharacteristics.find(characteristic => characteristic.uuid === object.uuid);
            } catch (e) {
                console.log(e);
            }
            console.log("writing to device:");
            if (characteristic != null) {
                let bufferToSend;
                if (object.dataType == "boolean") {
                    console.log("boolean")
                    bufferToSend = Int8Array.of(object.value);
                } else if (object.dataType == "integer" || typeof object.value == "int") {
                    console.log("int")
                    bufferToSend = Int32Array.of(object.value);
                } else if (object.dataType == "number") {
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
                        console.log(' > ' + bufferToSend);
                        returnObject.value = "success!"
                        resolve(returnObject);
                    })
                    .catch(error => {
                        console.log('Argh! ' + error);
                        returnObject.value = error;
                        resolve(returnObject);
                    });
            } else {
                returnObject.value = "error: characteristic is not defined for "+object.name;
                resolve(returnObject);
            }
        })
    }

    read(object) {
        let returnObject = {
            description: "reading characteristic",
            value: "",
        }
        return new Promise((resolve, reject) => {
            console.log("readCharacteristic");
            if (object.uuid) {
                let uuid = object.uuid;
                console.log(uuid);
                let characteristic = this.myCharacteristics.find(characteristic => characteristic.uuid === uuid);
                console.log(uuid);
                console.log(characteristic);
                if (characteristic != null) {

                    characteristic.readValue().then(value => {
                        console.log("value");
                        console.log(value);

                        let incomingValue = 0;
                        console.log(' > uuid ' + uuid);
                        console.log(' > value ' + incomingValue);

                        if (object.dataType == "boolean") {
                            incomingValue = value.getInt8();
                        } else if (object.dataType == "integer" || typeof object.value == "int") {
                            incomingValue = value.getInt32();
                        } else if (object.dataType == "number") {
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

    }

}

export default BLECommunication;