class SpeechToText {
	constructor(submitPrompt) {
		this.submitPrompt = submitPrompt;
		this.SpeechRecognitionOn = false;
		this.SpeechRecognizer = null
		this.chkSpeak = false;
		
		this.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
		this.SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
		this.SpeechRecognitionEvent = window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;


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
	begin() {
		if (this.SpeechRecognitionOn) {
			this.chkSpeak = true;
			this.SpeechRecognizer = new this.SpeechRecognition();
			this.SpeechRecognizer.continuous = true;
			this.SpeechRecognizer.interimResults = true;
			this.SpeechRecognizer.lang = "en-US"; // or "de-DE"
			this.SpeechRecognizer.start();
			this.SpeechRecognizer.onresult = function (event) {
				console.log("onresult");
				let interimTranscripts = "";
				let prompt = document.getElementById("prompt");
				for (let i = event.resultIndex; i < event.results.length; i++) {
					let transcript = event.results[i][0].transcript;
					if (event.results[i].isFinal) {
						this.submitPrompt(transcript, "user");
					} else {
						transcript.replace("\n", "<br>");
						interimTranscripts += transcript;
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
		if (this.SpeechRecognizer && this.chkSpeak) {
			this.SpeechRecognizer.start();
		}
	}

	pause() {
		if (this.SpeechRecognizer && this.chkSpeak) {
			//do not listen to user when speech synthesis is happening 
			console.log("stop speech recognizer");
			this.SpeechRecognizer.stop();
		}
	}
}
export default SpeechToText