import ICommunicationMethod from './ICommunicationMethod.js';
import { Serial, SerialEvents } from './Serial.js';

class SerialCommunication extends ICommunicationMethod {
  constructor(submitPrompt) {
    super();
    this.submitPrompt = submitPrompt;
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
      description: "Connected",
      value: true,
    }
    return new Promise((resolve, reject) => {
      console.log('Requesting Serial Device...');
      if (!this.serial.isOpen()) {
        this.serial.connectAndOpen(null, this.serialOptions).then(() => {
          resolve(returnObject);
        }).catch(error => {
          returnObject.description = "Error";
          returnObject.value = error;
          resolve(returnObject);
        });
      } else {
        this.serial.autoConnectAndOpenPreviouslyApprovedPort(this.serialOptions).then(() => {
          resolve(returnObject);
        }).catch(error => {
          returnObject.description = "Error";
          returnObject.value = error;
          resolve(returnObject);

        });
      }
    });
  }

  write(data) {
    let returnObject = {
      description: "Writing to Serial",
      value: "",
    }

    data.resolved = false; // use this for keeping track of resolution 
    //
    console.log("write data", data);

    let dataToSend = "" + data.name + "" + data.value;

    return new Promise((resolve, reject) => {

      if (!this.serial || !this.serial.isOpen) {
        console.log('Port is not open');
        returnObject.description = 'Port is not open'
        resolve(returnObject);
      }
      console.log('Writing to Serial...', dataToSend);
      this.serial.write(dataToSend, (err) => {
        if (err) {
          console.log('Error writing to port: ', err);
          returnObject.description = `Error writing to port: ${err.message}`
          resolve(returnObject);
        }
      });
      /*
      this.currentCommand = data;
      let startTime = Date.now();
      let timeout = 5000; // Timeout in milliseconds (5 seconds)
      let timedOutTriggered = false;
      while (this.currentCommand.resolved == false) {
        // Check if the timeout has been reached
        if (Date.now() - startTime > timeout) {
          console.log("Timeout reached, breaking out of the loop.");
          returnObject.description = "Timeout on Serial: check hardware"
          this.currentCommand = null;
          timedOutTriggered = true;
          break;
        }
      }
      if (!timedOutTriggered) {
        this.currentCommand = null;
        returnObject.description = "Serial write successful";
      }
      console.log("resolving");
      */
      console.log("resolving");
      returnObject.description = "Serial write successful";
      resolve(returnObject);
    });
  }

  read(data) {
    let returnObject = {
      description: "Getting data from device, notifying when done",
      value: "",
    }

    data.resolved = false; // use this for keeping track of resolution 
    //

    let dataToSend = "" + data.name;

    return new Promise((resolve, reject) => {

      if (!this.serial || !this.serial.isOpen) {
        console.log('Port is not open');
        returnObject.description = 'Port is not open'
        resolve(returnObject);
      }
      console.log('Writing to Serial...', dataToSend);
      this.serial.write(dataToSend, (err) => {
        if (err) {
          console.log('Error writing to port: ', err);
          returnObject.description = `Error writing to port: ${err.message}`
          resolve(returnObject);
        }
      });
      resolve(returnObject);
    });
  }

  checkConection() {
    return new Promise((resolve, reject) => {
      let returnObject = {
        description: "Connected",
        value: this.connected,
      }
      resolve(returnObject);
    })
  }

  async closePort() {
    if (this.serial.isOpen()) {
      await this.serial.close(); event
      this.connected = true;
    }
  }
  /// 
  onSerialErrorOccurred(eventSender, error) {
   // this.connected = false;
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
    console.log("onSerialDataReceived", newData);

    console.log("notify event")
    console.log(newData)

    const parts = newData.split(':');
    if (parts.length === 2) {

      const commandName = parts[0];
      const value = parts[1];

      let notifyObject = Notify.find(notifyObj => notifyObj.name === commandName);
      if (notifyObject != null) {
        console.log("there is a matching function in the Notify list")
        // there is a matching function in the Notify list
        let oldValue = notifyObject.value;
        notifyObject.value = value;

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
          console.log(updateObject)
          console.log(JSON.stringify(updateObject))
          console.log(this.submitPrompt)
          // todo:improve the handling of notifcations 
          this.submitPrompt(JSON.stringify(updateObject), "system");
        }
      } else {
        let notifyObject = Object.keys(functionList).find(key => key === commandName);
        if (notifyObject != null) {
          console.log("there is a matching function in the function list")
          let updateObject = {
            description: commandName,
            value: value,
          }
          this.submitPrompt(JSON.stringify(updateObject), "system");
          // this could be a response from an earlier command 

        }
      }
    }
  }
}

export default SerialCommunication;