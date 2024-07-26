let bTextToSpeechSupported = false;
let SpeechRecognitionOn = false;
let bSpeechInProgress = false;
let oSpeechRecognizer = null
let oSpeechSynthesisUtterance = null;
let oVoices = null;
let chkSpeak = false;

function setupSpeech() {
	if ("webkitSpeechRecognition" in window) {
		console.log("webkitSpeechRecognition is on");
		SpeechRecognitionOn = true;
	} else {
		//speech to text not supported
	}

	if ('speechSynthesis' in window) {
		console.log("speechSynthesis is on");
		bTextToSpeechSupported = true;
		speechSynthesis.onvoiceschanged = function () {
			oVoices = window.speechSynthesis.getVoices();
			for (var i = 0; i < oVoices.length; i++) {
				console.log(i + " " + oVoices[i].name)
			}
		};
	}
}


function TextToSpeech(s) {

	if (bTextToSpeechSupported == false) return;
	//if (chkMute.checked) return;
	console.log("TextToSpeech");
	oSpeechSynthesisUtterance = new SpeechSynthesisUtterance();

	if (oVoices) {
		let voice = "Google US English"
		const index = oVoices.map(e => e.name).indexOf(voice);
		oSpeechSynthesisUtterance.voice = oVoices[index];
	}

	oSpeechSynthesisUtterance.onerror = (event) => {
		console.log(
			`An error has occurred with the speech synthesis: ${event.error}`,
		);
	}


	oSpeechSynthesisUtterance.onend = function () {
		//finished talking - can now listen
		console.log("finished talking");
		if (oSpeechRecognizer && chkSpeak) {
			oSpeechRecognizer.start();
		}
	}


	oSpeechSynthesisUtterance.addEventListener("start", (event) => {
		console.log(`We have started uttering this speech: ${event.utterance.text}`);
		if (oSpeechRecognizer && chkSpeak) {
			//do not listen to yourself when talking
			console.log("stop speach recognizer");
			oSpeechRecognizer.stop();
		}
	});

	oSpeechSynthesisUtterance.lang = "en-US";
	oSpeechSynthesisUtterance.text = s;
	oSpeechSynthesisUtterance.rate = 1.2;
	try {
		//	console.log(oSpeechSynthesisUtterance);
		window.speechSynthesis.cancel();// need this because of chrome bug
		window.speechSynthesis.speak(oSpeechSynthesisUtterance);
	} catch (ex) {
		//txtOutputVal += "Error: " + ex.message
		console.log("Error: " + ex.message);
	}
}
function pauseSpeechTasks() {
	try {
		window.speechSynthesis.cancel();// need this because of chrome bug
		oSpeechRecognizer.stop();
	} catch (e) { }
}

function SpeechToText() {
	if (SpeechRecognitionOn) {
		chkSpeak = true;
		oSpeechRecognizer = new webkitSpeechRecognition();
		oSpeechRecognizer.continuous = true;
		oSpeechRecognizer.interimResults = true;
		oSpeechRecognizer.lang = "en-US"; // or "de-DE"
		oSpeechRecognizer.start();
		oSpeechRecognizer.onresult = function (event) {

			let interimTranscripts = "";
			let prompt = document.getElementById("prompt");
			for (let i = event.resultIndex; i < event.results.length; i++) {
				let transcript = event.results[i][0].transcript;
				if (event.results[i].isFinal) {
					submitPrompt(transcript, "user");
					//prompt.innerHTML = "";
				} else {
					transcript.replace("\n", "<br>");
					interimTranscripts += transcript;
					console.log(interimTranscripts);
					prompt.value = interimTranscripts;
				}
			}
		};

		oSpeechRecognizer.onerror = function (event) {
			console.log("error in speech recognition");
		};
	}
}