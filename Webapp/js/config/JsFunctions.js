class jsFunctions {
    constructor(submitPrompt, communicationMethod) {
        this.channel = new BroadcastChannel('example_channel');
        this.channel.onmessage = (event) => {
            console.log('Received message in new window:', event.data);
            console.log(event.data.value);
        };

        this.communicationMethod = communicationMethod;
        this.submitPrompt = submitPrompt;
        // add all custom functions to the window context 
        this.functions = this.autoBindFunctions();
        //
        // add the following line for a new window to open, use the broadcast method to communicate between the browser and the new window
        //  window.open("http://127.0.0.1:5502/Webapp/js/config/newWindow.html", "_blank").focus();		
		this.broadCast("init");

        // bind the star_pressed function to the document
        document.addEventListener('keydown', (event) => {
            if (event.key === '*') {
                console.log("star pressed")
                this.star_pressed();
            }
        });
    }

    autoBindFunctions() {
        const functions = {};
        const prototype = Object.getPrototypeOf(this);
        const properties = Object.getOwnPropertyNames(prototype);
        for (const prop of properties) {
            if (typeof this[prop] === 'function' && 
                prop !== 'constructor' && 
                prop !== 'autoBindFunctions' &&
                prop !== 'executeFunction' &&
                prop !== 'getFunctionList') {
                functions[prop] = this[prop].bind(this);
            }
        }
        return functions;
    }

    executeFunction(functionName, args) {
        if (this.functions[functionName]) {
            return this.functions[functionName](args);
        } else {
            console.error(`Function ${functionName} not found`);
        }
    }

    getFunctionList() {
        return Object.keys(this.functions).reduce((acc, key) => {
            acc[key] = { dataType: 'boolean', description: 'Custom function' };
            return acc;
        }, {});
    }

    broadCast(message) {
        this.channel.postMessage({ type: 'update', value: message });
    }


    ////////////////////////////////////////////////////////////
    // Example Function
    // Bellow this line you can add your own custom functions.
    //////////////////////////////////////////////////////
    start_party(command) {
        function createGlitter() {
            const glitter = document.createElement('div');
            glitter.style.position = 'absolute';
            glitter.style.width = '10px';
            glitter.style.height = '10px';
            glitter.style.background = `radial-gradient(circle, ${getRandomColor()}, rgba(255, 255, 255, 0))`;
            glitter.style.borderRadius = '50%';
            glitter.style.left = Math.random() * 100 + 'vw';
            glitter.style.top = '0';
            glitter.style.opacity = '1';
            glitter.style.transition = `transform ${Math.random() * 3 + 2}s linear, opacity ${Math.random() * 3 + 2}s linear`;
            document.body.appendChild(glitter);

            requestAnimationFrame(() => {
                glitter.style.transform = 'translateY(100vh)';
                glitter.style.opacity = '0';
            });

            setTimeout(() => {
                glitter.remove();
            }, 5000);
        }

        function getRandomColor() {
            const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'pink', 'orange'];
            return colors[Math.floor(Math.random() * colors.length)];
        }

        console.log("command: " + command);
        setInterval(createGlitter, 10);
    }

    
    update_p5() {
          this.broadCast("hello from chatGPT!");  
    }
    ////////////////////////////////////////////////////////////
    // Event Function Example

    star_pressed() {
        console.log("star pressed")
        let updateObject = {
                description: "star_pressed",
                value: "true",
                type: "bool",
            }
        this.submitPrompt(JSON.stringify(updateObject));
    }


}

export default jsFunctions;