class TextToSpeechOpenAI {

    constructor(SpeechRecognizer) {
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
        this.audioPlayer = null; // Initialize the audio player variable
    }

   async say(text) {
        if (this.TextToSpeechSupported == false) return;
        console.log("TextToSpeech");
        if (!text) {
            console.log('No text to synthesyze.');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/text-to-speech', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text })
            });

            if (!response.ok) {
                throw new Error('Error processing text-to-speech request');
            }

            const data = await response.json();
            this.audioPlayer = new Audio(data.url);

            // Event listener for when audio starts playing
            this.audioPlayer.addEventListener('play', () => {
                console.log('Speech playback started');
                this.SpeechRecognizer.pause()
            });

            // Event listener for when audio ends
            this.audioPlayer.addEventListener('ended', () => {
                console.log("finished talking");
                this.SpeechRecognizer.resume()
            });

            // Function to stop the audio player
            const stopAudio = () => {
                this.audioPlayer.pause();
                this.audioPlayer.currentTime = 0;
                console.log('Audio playback stopped');
            };

            this.audioPlayer.play();
        } catch (error) {
            console.error('Error:', error);
        }
    }
    pause() {
        try {
            if (this.audioPlayer && !this.audioPlayer.paused) {
                this.audioPlayer.pause();
                console.log('Audio paused');
            } else {
                console.log('No audio is playing');
            }
        } catch (e) { }
    }
}
export default TextToSpeechOpenAI;