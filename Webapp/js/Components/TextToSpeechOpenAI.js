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

            // Monitor buffering progress
            this.audioPlayer.addEventListener('progress', () => {
                console.log('Buffering...');

                if (this.audioPlayer.buffered.length > 0) {
                    const bufferedEnd = this.audioPlayer.buffered.end(this.audioPlayer.buffered.length - 1);
                    const duration = this.audioPlayer.duration;
                    console.log(`${bufferedEnd} of ${duration}`);

                    // Check if a sufficient amount (e.g., 20%) of the file is buffered
                    if (bufferedEnd / duration > 0.2 && !this.audioPlayer.playing) {
                        this.audioPlayer.play();
                    }
                }
            });
            // Event listener for when audio can start playing
            this.audioPlayer.addEventListener('canplay', () => {
                console.log('Audio can start playing, but may still buffer.');
            });

            // Event listener for when audio can play through without buffering
            this.audioPlayer.addEventListener('canplaythrough', () => {
                console.log('Audio can play through without buffering.');
                if (!this.audioPlayer.playing) {
                    this.audioPlayer.play();
                }
            });

            // Event listener for time updates
            this.audioPlayer.addEventListener('timeupdate', () => {
                console.log(`Current playback time: ${this.audioPlayer.currentTime}`);
            });

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

         // Handle errors
         this.audioPlayer.addEventListener('error', (e) => {
            console.error('Error during playback:', e);
            console.error('Error details:', {
                type: e.type,
                target: e.target,
                currentTarget: e.currentTarget,
                eventPhase: e.eventPhase,
                timeStamp: e.timeStamp,
                defaultPrevented: e.defaultPrevented,
                isTrusted: e.isTrusted,
            });

            // Additional error details
            const errorCode = e.target.error ? e.target.error.code : 'unknown';
            console.error('Audio error code:', errorCode);
            console.error('Audio source URL:', this.audioPlayer.src);

            // Check if the audio file is accessible
            fetch(this.audioPlayer.src)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.blob();
                })
                .then(blob => {
                    console.log('Audio file is accessible and has been fetched successfully.');
                })
                .catch(error => {
                    console.error('Error fetching the audio file:', error);
                });
        });


            // Handle stalled and waiting events
            this.audioPlayer.addEventListener('stalled', () => {
                console.log('Playback stalled, buffering more data...');
                this.audioPlayer.pause();
            });

            this.audioPlayer.addEventListener('waiting', () => {
                console.log('Playback waiting, buffering more data...');
                this.audioPlayer.pause();
            });

            // Function to stop the audio player
            const stopAudio = () => {
                this.audioPlayer.pause();
                this.audioPlayer.currentTime = 0;
                console.log('Audio playback stopped');
            };

            // Start loading the audio file
            this.audioPlayer.load();
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