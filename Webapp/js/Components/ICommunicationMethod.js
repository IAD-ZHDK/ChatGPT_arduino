class ICommunicationMethod {
    constructor(submitPrompt) {
        this.submitPrompt = submitPrompt;
    }
    connect() {
        throw new Error("Method 'connect()' must be implemented.");
    }

    write(data) {
        throw new Error("Method 'send(data)' must be implemented.");
    }

    read(data) {
        throw new Error("Method 'read(data)' must be implemented.");
    }

    recieve() {
        throw new Error("Method 'recieve()' must be implemented.");
    }

    onDisconnected() {
        throw new Error("Method 'disconnect()' must be implemented.");
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
    
}

export default ICommunicationMethod;