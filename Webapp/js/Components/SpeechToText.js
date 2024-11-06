class SpeechToText {
	constructor(submitPrompt) {
		this.submitPrompt = submitPrompt;
		this.SpeechRecognitionOn = false;
		this.SpeechRecognizer = null
		this.chkSpeak = false;
		this.isPaused = true;
		this.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
		this.SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
		this.SpeechRecognitionEvent = window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;
		this.commandline = document.getElementById('commandline');
		if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
			console.log("speechRecognition is supported");
			this.SpeechRecognitionOn = true;
		} else {
			//speech to text not supported
		}
	}

	/**
	 * Start speech recognition. If speech recognition is supported by the browser
	 * This function must be called from a user input event like a button click
	 */
	begin(overWriteComplete = false) {
		if (this.SpeechRecognitionOn) {
			this.chkSpeak = true;
			this.SpeechRecognizer = new this.SpeechRecognition();
			this.SpeechRecognizer.continuous = true;
			this.SpeechRecognizer.interimResults = true;
			this.SpeechRecognizer.lang = "en-US"; // or "de-DE"
			this.SpeechRecognizer.start();
			this.isPaused = false;
			this.runningTranscript = ""
			this.overWriteAuotComplete = overWriteComplete;
			this.updateStatusDisplay();
			this.transcript = "";

			this.SpeechRecognizer.onresult = function (event) {
				console.log("onresult");
				let interimTranscripts = "";
				let prompt = document.getElementById("prompt");
				for (let i = event.resultIndex; i < event.results.length; i++) {
					this.transcript = event.results[i][0].transcript;
					if (event.results[i].isFinal) {
						this.submitPrompt(this.transcript, "user");
					} else {
						this.transcript.replace("\n", "<br>");
						interimTranscripts += this.transcript;
						console.log(interimTranscripts);
						prompt.value = interimTranscripts;
					}
				}
			}.bind(this)

			this.SpeechRecognizer.onerror = function (event) {
				console.error(`Speech recognition error detected: ${event.error}`);
			};
		}
	}

	resume() {
		if (!this.overWriteAuotComplete) {
			this.manuelResume();
		}
	}

	manuelResume() {
		this.isPaused = false;
		this.updateStatusDisplay();
		if (this.SpeechRecognizer && this.chkSpeak) {
			this.SpeechRecognizer.start();
		}
	}

	manuelComplete() {
		this.submitPrompt(this.transcript, "user");
	}

	pause() {
		this.isPaused = true;
		this.updateStatusDisplay();
		if (this.SpeechRecognizer && this.chkSpeak) {
			//do not listen to user when speech synthesis is happening 
			console.log("stop speech recognizer");
			this.SpeechRecognizer.stop();
		}
	}
	updateStatusDisplay() {
		if (this.chkSpeak == true) {
			// Remove existing mic circle if any
			const existingCircle = this.commandline.querySelector('.mic-circle');
			if (existingCircle) {
				this.commandline.removeChild(existingCircle);
			}

			// Create a new mic circle
			const micCircle = document.createElement('div');
			micCircle.classList.add('mic-circle');
			micCircle.classList.add(this.isPaused ? 'red' : 'green');

			// Insert the mic circle at the beginning of the commandline div
			this.commandline.insertBefore(micCircle, this.commandline.firstChild);
		}
	}
}
export default SpeechToText