
let bleConnected = false;
let myCharacteristics = [];
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
    connectToBle() {
        return new Promise(function (resolve, reject) {
            console.log('Requesting Bluetooth Device...');
            if (navigator.bluetooth == undefined) {
                let returnObject = {
                    description: "Error",
                    value: "BLE does not appear to be accesable in your browser. Try using Chrome",
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
                    console.log('Getting all Notifications started');
                    for (const c in characteristics) {
                        myCharacteristics.push(characteristics[c]);
                        // characteristics[c].startNotifications().then(_ => {
                        //     characteristics[c].addEventListener('characteristicvaluechanged', handleNotifications);
                        // });
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

    writeToCharacteristic(object) {
        let returnObject = {
            description: "Writing to Characteristic",
            value: "",
        }
        return new Promise(function (resolve, reject) {
            // if (object.uuid && object.value) {
            let characteristic = myCharacteristics.find(characteristic => characteristic.uuid === object.uuid);
            console.log(object.uuid);
            console.log(object.value);
            console.log(myCharacteristics);
            if (characteristic != null) {
                let bufferToSend = Int8Array.of(object.value);
                characteristic.writeValueWithResponse(bufferToSend)
                    .then(_ => {
                        console.log(' > uuid ' + object.uuid);
                        console.log(' > value ' + object.value);
                        console.log(' > Characteristic changed to: ' + bufferToSend);
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

    readCharacteristic(object) {

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
                        let incomingFloat = value.getInt32(0, true);
                        console.log(' > uuid ' + uuid);
                        console.log(' > value ' + incomingFloat);
                        returnObject.value = incomingFloat;
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
