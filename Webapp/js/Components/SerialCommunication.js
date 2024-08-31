import ICommunicationMethod from './ICommunicationMethod.js';
import { Serial, SerialEvents } from './Serial.js';

class SerialCommunication extends ICommunicationMethod {
  constructor() {
    super();
    this.connected = false;
    this.serialOptions = { baudRate: 9600 }
    // Setup Web Serial using serial.js
    this.serial = new Serial();
    this.serial.on(SerialEvents.CONNECTION_OPENED, this.onSerialConnectionOpened.bind(this));
    this.serial.on(SerialEvents.CONNECTION_CLOSED, this.onDisconnected.bind(this));
    this.serial.on(SerialEvents.DATA_RECEIVED, this.receive.bind(this));
    this.serial.on(SerialEvents.ERROR_OCCURRED, this.onSerialErrorOccurred.bind(this));
    this.serialData = ""
  }

  connect() {
    let returnObject = {
      description: "Serial connection",
      value: true,
    }

    return new Promise((resolve, reject) => {
      console.log('Requesting Serial Device...');

      if (!this.serial.isOpen()) {
        this.serial.connectAndOpen(null, this.serialOptions).then(() => {
          resolve(returnObject);
        }).catch(error => {
           returnObject.description =  "Error";
           returnObject.value = error;
          resolve(returnObject);
      });
      } else {
        this.serial.autoConnectAndOpenPreviouslyApprovedPort(this.serialOptions).then(() => {
          resolve(returnObject);
        }).catch(error => {
          returnObject.description =  "Error";
          returnObject.value = error;
         resolve(returnObject);
         
     });
      }
    });
  }

  write(data) {
    return new Promise((resolve, reject) => {
      if (!this.serial || !this.serial.isOpen) {
        return reject('Port is not open');
      }
      this.serial.write(data, (err) => {
        if (err) {
          return reject(`Error writing to port: ${err.message}`);
        }
        resolve();
      });
    });
  }

  read(data) {
    throw new Error("Method 'read(data)' must be implemented.");
  }

  recieve() {
    throw new Error("Method 'receive()' must be implemented.");
  }

  checkConection() {
    return new Promise((resolve, reject) => {
      let returnObject = {
          description: "Serial connection",
          value:  this.connected,
      }
      resolve(returnObject);
  })
  }



  async closePort() {
    if (this.serial.isOpen()) {
      await this.serial.close();
      this.connected = true; 
    }
  }
  /// 
  onSerialErrorOccurred(eventSender, error) {
    this.connected = false; 
    console.log("onSerialErrorOccurred");
    console.log(error);
  }

  onSerialConnectionOpened(eventSender) {
    this.connected = true; 
    console.log("onSerialConnectionOpened");
  }


  onDisconnected(eventSender) {
    this.connected = false; 
    console.log("onSerialConnectionClosed");
  }

  receive(eventSender, newData) {
    console.log(" 🎉 🎊 event! 🎉 🎊 ")
    JSON.parse(newData);
    console.log("onSerialDataReceived", newData);

  }
}

export default SerialCommunication;