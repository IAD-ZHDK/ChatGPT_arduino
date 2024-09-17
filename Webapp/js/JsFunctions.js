class jsFunctions {
    constructor(submitPrompt, communicationMethod) {
        this.submitPrompt = submitPrompt;
        this.communicationMethod = communicationMethod;
        // add all your custom functions to the window context 
        window.star_pressed = this.star_pressed.bind(this); // Attach to window

        document.addEventListener('keydown', (event) => {
            if (event.key === '*') {
                console.log("star pressed")
                this.star_pressed();
            }
        });
    }

    start_party(command) {
// this is an example function for testing 
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
    
    ///////////// Event Function Example //////////////
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