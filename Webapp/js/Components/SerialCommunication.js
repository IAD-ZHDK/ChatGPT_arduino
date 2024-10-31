import ICommunicationMethod from './ICommunicationMethod.js';
import { Serial, SerialEvents } from './Serial.js';

class SerialCommunication extends ICommunicationMethod {
  constructor(submitPrompt) {
    super(submitPrompt);
    this.connected = false;
    this.pendingReadPromise = null;
    this.pendingReadResolve = null;
    this.serialOptions = { baudRate: 115200 }
    // Setup Web Serial using serial.js
    this.serial = new Serial();
    this.serial.on(SerialEvents.CONNECTION_OPENED, this.onSerialConnectionOpened.bind(this));
    this.serial.on(SerialEvents.CONNECTION_CLOSED, this.onDisconnected.bind(this));
    this.serial.on(SerialEvents.DATA_RECEIVED, this.receive.bind(this));
    this.serial.on(SerialEvents.ERROR_OCCURRED, this.onSerialErrorOccurred.bind(this));
    this.writeRaw = this.writeRaw.bind(this);
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
          // todo: this.serial.isOpen returns null at this point
          returnObject.value = this.serial.isOpen();
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

  checkConection() {
    return new Promise((resolve, reject) => {
      let returnObject = {
        description: "Connected",
        value: this.connected,
      }
      if (this.serialConnectec() == false) {
        returnObject.value = false;
      }
      resolve(returnObject);
    })
  }
  serialConnectec() {
    if (!this.serial || !this.serial.isOpen) {
      this.connected = false;
      return false
    } else {
      this.connected = true;
      return true
    }
  }

  write(data) {
    let returnObject = {
      description: "Writing to Serial",
      value: "",
    }

    //
    console.log("write data", data);

    let dataToSend = "" + data.name + "" + data.value;

    return new Promise((resolve, reject) => {

      if (this.checkSerialConection == false) {
        console.log('Port is not open');
        resolve(this.checkConection());
      }
      console.log('Writing to Serial...', dataToSend);
      this.serial.write(dataToSend, (err) => {
        if (err) {
          console.log('Error writing to port: ', err);
          returnObject.description = `Error writing to port: ${err.message}`
          resolve(returnObject);
        }
      });
      console.log("resolving");
      returnObject.description = "Serial write successful";
      resolve(returnObject);
    });
  }

  writeRaw(DataString) {
    let returnObject = {
      description: "Writing to Serial",
      value: "",
    }

    //
    console.log("write data", DataString);

    let dataToSend = DataString;

    return new Promise((resolve, reject) => {

      if (this.serialConnectec() != true) {
        console.log('Port is not open');
        resolve(this.checkConection());
      }
      console.log('Writing to Serial...', dataToSend);
      this.serial.writeLine(dataToSend, (err) => {
        if (err) {
          console.log('Error writing to port: ', err);
          returnObject.description = `Error writing to port: ${err.message}`
          resolve(returnObject);
        }
      });
      console.log("resolving");
      returnObject.description = "Serial write raw successful";
      resolve(returnObject);
    });
  }

  read(data) {
    console.log("waiting for read response");
    // todo: need to make a time out incase there is not response!
    let returnObject = {
      description: "",
      value: "",
    }

    data.resolved = false; // use this for keeping track of resolution 
    //

    let dataToSend = "" + data.name;

    return new Promise((resolve, reject) => {
      this.pendingReadPromise = true;
      this.pendingReadResolve = resolve;

      if (this.serialConnectec() != true) {
        console.log('Port is not open');
        resolve(checkConection());
      }
      console.log('Writing to Serial...', dataToSend);
      this.serial.write(dataToSend, (err) => {
        if (err) {
          console.log('Error writing to port: ', err);
          returnObject.description = `Error writing to port: ${err.message}`
          resolve(returnObject);
        }
      });
    });
  }

  async closePort() {
    if (this.serial.isOpen()) {
      await this.serial.close(); 
      this.connected = false;
    }
  }
  /// 
  onSerialErrorOccurred(eventSender, error) {
    //console.log("onSerialErrorOccurred");
    //console.log(error);
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
    console.log("new serial communication")
    console.log(newData)

    const parts = newData.split(':');

    if (parts.length === 2) {

      const commandName = parts[0];
      const value = parts[1];

      let notifyObject = config.notifications.find(notifyObj => notifyObj.name === commandName);
      if (notifyObject != null) {
        // there is a matching function in the Notify list
        let oldValue = notifyObject.value;
        notifyObject.value = value;

        let updateObject = {
          description: notifyObject.info,
          value: notifyObject.value,
          type: notifyObject.type,
        }
        console.log(updateObject)

        if (updateObject.type == "GPT_ignore") {
          // pass the data to the browser window, but not to ChatGPT
          try{
          window.myGlobalObject.name = commandName; 
          window.myGlobalObject.value = updateObject.value; 
          } catch(err){
            console.log(err)
          }
        } else if (notifyObject.type == "boolean" && notifyObject.checkOn != "change") {
            // handle boolean events
          if (oldValue < notifyObject.value && notifyObject.checkOn == "rise") {
            // rising
            console.log("value rising")
            // todo:improve the handling of notifcations 
            this.submitPrompt(JSON.stringify(updateObject));
          } else if (oldValue > notifyObject.value && notifyObject.checkOn == "fall") {
            //falling
            console.log("value falling")
            // todo:improve the handling of notifcations 
            this.submitPrompt(JSON.stringify(updateObject));
          }
        } else {
          console.log("value change")
          console.log(updateObject)
          console.log(JSON.stringify(updateObject))
          console.log(this.submitPrompt)
          this.submitPrompt(JSON.stringify(updateObject));
        }
      } else {
        // This relates to responses from over serial, from prevous requests 
        console.log(this.pendingReadPromise)
        if (this.pendingReadPromise) {
          try {
          let notifyObject = Object.keys(config.functionList).find(key => key === commandName);
         
          if (notifyObject != null) {
            let updateObject = {
              description: commandName,
              value: value,
            }
            this.pendingReadResolve(updateObject);
            this.pendingReadResolve = null;
            this.pendingReadPromise = null;

          }
        } catch (error) {
          console.log(error)
        }
        }
      }
    }
  }
}

export default SerialCommunication;