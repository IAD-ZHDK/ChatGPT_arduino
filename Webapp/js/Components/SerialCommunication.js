import ICommunicationMethod from './ICommunicationMethod.js';
import Serial from 'https://cdn.jsdelivr.net/gh/makeabilitylab/p5js/_libraries/serial.js';

class SerialCommunication extends ICommunicationMethod {
    constructor() {
        super();
        this.serialOptions = { baudRate: 9600 }
        // Setup Web Serial using serial.js
        this.serial = new Serial();
        this.serial.on(SerialEvents.CONNECTION_OPENED, this.onSerialConnectionOpened);
        this.serial.on(SerialEvents.CONNECTION_CLOSED, this.onSerialConnectionClosed);
        this.serial.on(SerialEvents.DATA_RECEIVED, this.onSerialDataReceived);
        this.serial.on(SerialEvents.ERROR_OCCURRED, this.onSerialErrorOccurred);
        this.serialData = ""
    }
     connect() {
        return new Promise((resolve, reject) => {
            connectPort();
            resolve();
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

    onDisconnected() {
        throw new Error("Method 'disconnect()' must be implemented.");
    }
    checkConection() {
        throw new Error("Method 'checkConection()' must be implemented.");
    }

    str2ab(str) {
        // converts string to array object
        var buf = new ArrayBuffer(str.length);
        var bufView = new Uint8Array(buf);
        for (var i=0, strLen=str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
        }
        return buf;
    };

     // Method to return the function itself if it exists
     getMethod(methodName) {
        return typeof this[methodName] === 'function' ? this[methodName] : null;
    }


    async connectPort() {
        if (!serial.isOpen()) {
          await serial.connectAndOpen(null, serialOptions);
        } else {
          serial.autoConnectAndOpenPreviouslyApprovedPort(serialOptions);
        }
      }
      
      async closePort() {
        if (serial.isOpen()) {
          await serial.close();
        }
      }
      /// 
    onSerialErrorOccurred(eventSender, error) {
        console.log("onSerialErrorOccurred", error);
        msg.html(error);
      }
      
    onSerialConnectionOpened(eventSender) {
        console.log("onSerialConnectionOpened");
        msg.html("Serial connection opened successfully");
      }
      
      
    onSerialConnectionClosed(eventSender) {
        console.log("onSerialConnectionClosed");
        msg.html("onSerialConnectionClosed");
      }
      
     onSerialDataReceived(eventSender, newData) {
        serialData = JSON.parse(newData);
        console.log("onSerialDataReceived", newData);
        msg.html("onSerialDataReceived: " + newData);
      }
    
}

export default SerialCommunication;