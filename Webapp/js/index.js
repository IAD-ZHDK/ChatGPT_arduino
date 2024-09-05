import BLECommunication from './Components/BLECommunication.js';
import SerialCommunication from './Components/SerialCommunication.js';
import ChatGPTAPI from './Components/ChatGPTAPI.js';
import View from './View.js';
import jsFunctions from './JsFunctions.js';
import TextToSpeech from './Components/TextToSpeech.js';
import TextToSpeechOpenAI from './Components/TextToSpeechOpenAI.js';

import SpeechToText from './Components/SpeechToText.js';
import checkServerStatus from './Components/CheckServer.js';

let communicationMethod = null;
let ChatGPT = null;
let localFunctions = null;
let userActive = false;
let screenView = null;
let SpeechSynthesiser = null;
let SpeechRecognizer = null;

function submitPrompt(input, role = "system") {

	let prompt = document.getElementById("prompt");
	if (input != "") {
		screenView.textLogerln(input, role)
		userActive = false;
		let thinking = document.getElementById("thinking");
		thinking.style.display = "inline-block";
		prompt.style.display = "none"
		ChatGPT.send(input, role).then((returnObject) => {
			// handle nested promises that might be returned
			recievedMessage(returnObject)
		}).catch(error => screenView.textLogerln(error.message, "assistant"));
		input = ''; // clear prompt box
	}

	function endExchange() {
		userActive = true;
		prompt.value = ''; // clear prompt box
		thinking.style.display = "none";
		prompt.style.display = "inline-block";
	}
	function recievedMessage(returnObject) {
		// TODO: protect against endless recursion
		screenView.textLogerln(returnObject.message, returnObject.role)
		if (returnObject.role == "assistant") {
			SpeechSynthesiser.say(returnObject.message);
		}
		if (returnObject.promise != null) {
			// there is another nested promise 
			returnObject.promise.then((returnObject) => {
				recievedMessage(returnObject)
			})
		} else {
			endExchange()
		}
	}
}


window.onload = function () {
	if (commMethod == "BLE") {
		communicationMethod = new BLECommunication(submitPrompt);
	} else if (commMethod == "Serial") {
		communicationMethod = new SerialCommunication(submitPrompt);
	} else {
		communicationMethod = new SerialCommunication(submitPrompt);
	}

	localFunctions = new jsFunctions(submitPrompt);
	SpeechRecognizer = new SpeechToText(submitPrompt)
	// Call the function to initialize the SpeechSynthesiser
	initializeSpeechSynthesiser();



	screenView = new View();
	ChatGPT = new ChatGPTAPI(communicationMethod);
	screenView.textLogerln('<b>Welcome to ChatGPT BLE Arduino Connector</b>', "info");
	screenView.textLogerln("model: " + ChatGPT.getModel(), "info");
	screenView.textLogerln("🎤 speech recognition is " + ((SpeechRecognizer.chkSpeak) ? "on" : "off") + ". Press Ctrl+s to turn on", "info");
	screenView.textLogerln("🛜 Press Ctrl+b to connect to device, or ask ChatGPT to connect", "info");
	screenView.textLogerln("Edit the Params.js file, and get ChatGPT to connect to your device first.", "info");
	userActive = true
}


document.addEventListener("click", function () {
	document.getElementById("prompt").focus(); // Auto-focus prompt input on Keydown event
});

document.addEventListener("keydown", keypressed);


async function initializeSpeechSynthesiser() {
	try {
		const isRunning = await checkServerStatus("http://localhost:3000/");
		if (isRunning) {
			console.log('Server is running on port 3000');
			SpeechSynthesiser = new TextToSpeechOpenAI(SpeechRecognizer);
		} else {
			console.log('Server is not running on port 3000');
			SpeechSynthesiser = new TextToSpeech(SpeechRecognizer);
		}
	} catch (err) {
		console.error('Error checking server status:', err);
		SpeechSynthesiser = new TextToSpeech(SpeechRecognizer);
	}
}


function keypressed(event) {
	let prompt = document.getElementById("prompt");
	prompt.focus(); // Auto-focus prompt input on Keydown event

	if (userActive) {
		if (event.key == "Enter" || event == true) {
			// submit text and pause speech
			try {
				SpeechSynthesiser.pause();
				SpeechRecognizer.pause();
			} catch (error) {
				console.log(error);
			}
			submitPrompt(prompt.value, "user");
		}
	}

	// turn sound on "Ctrl+S"
	if (event.key == "s" && event.ctrlKey || event.key == "S" && event.ctrlKey) {
		SpeechRecognizer.begin();
		screenView.textLogerln("speech recognition is " + ((SpeechRecognizer.chkSpeak) ? "on" : "off") + " 🎤 ", "info");
	}

	// connect to Device with "Ctrl+b"
	if (event.key == "b" && event.ctrlKey || event.key == "B" && event.ctrlKey) {
		console.log("b clicked")
		communicationMethod.connect()
		screenView.textLogerln("trying to connect to device", "info");
	}
}

