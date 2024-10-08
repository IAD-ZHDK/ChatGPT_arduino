class TextToSpeech {

	constructor(SpeechRecognizer) {
        console.log("Text To Speech starting");

        // we need acess to the speech recognizer in order to pause it while synthesising speech 
        this.SpeechRecognizer = SpeechRecognizer;
        this.TextToSpeechSupported = false;
        this.SpeechSynthesisUtterance = null;
        if ('speechSynthesis' in window) {
            console.log("speechSynthesis is on");
            this.TextToSpeechSupported = true;
            speechSynthesis.onvoiceschanged = function () {
                this.Voices = window.speechSynthesis.getVoices();
                for (var i = 0; i < this.Voices.length; i++) {
                    //	console.log(i + " " + this.Voices[i].name)
                }
            };
        }
    }

    say(s) {
        if (this.TextToSpeechSupported == false) return;
        console.log("TextToSpeech: " + s);
        this.SpeechSynthesisUtterance = new SpeechSynthesisUtterance();
    
        if (this.Voices) {
            let voice = "native" // there seems to be a bug here with all the other voices
            const index = this.Voices.map(e => e.name).indexOf(voice);
            this.SpeechSynthesisUtterance.voice = this.Voices[index];
        }
    
        this.SpeechSynthesisUtterance.onerror = (event) => {
            console.log(
                `An error has occurred with the speech synthesis: ${event.error}`,
            );
        }
    
        this.SpeechSynthesisUtterance.onend = function () {
            //finished talking - we can now listen
            console.log("finished talking");
            this.SpeechRecognizer.resume() 
        }.bind(this);
    
        if (this.SpeechSynthesisUtterance && this.SpeechRecognizer) {
            this.SpeechSynthesisUtterance.addEventListener("start", (event) => {
                console.log(`We have started uttering this speech: ${event.utterance.text}`);
                console.log('SpeechRecognizer:', this.SpeechRecognizer);
                this.SpeechRecognizer.pause();
            });
        } else {
            console.error('SpeechSynthesisUtterance or SpeechRecognizer is not initialized.');
        }
        this.SpeechSynthesisUtterance.lang = "en-US";
        this.SpeechSynthesisUtterance.text = s;
        this.SpeechSynthesisUtterance.rate = 1.2;
        try {
            //	console.log(this.SpeechSynthesisUtterance);
            window.speechSynthesis.cancel();// need this because of chrome bug
            window.speechSynthesis.speak(this.SpeechSynthesisUtterance);
        } catch (ex) {
            //txtOutputVal += "Error: " + ex.message
            console.log("Error: " + ex.message);
        }
    }
     pause() {
        try {
            window.speechSynthesis.cancel();// need this because of chrome bug
        } catch (e) { }
    }
}
export default TextToSpeech;