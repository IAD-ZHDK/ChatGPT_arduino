
let userActive = false;

// outputs 
window.onload = function () {
	setupSpeech();

	textLogerln('<b>Welcome to ChatGPT BLE Arduino Connector</b>', "info");
	textLogerln("model: " + sModel, "info");
	textLogerln("speech recognition is " + ((chkSpeak) ? "on" : "off") + ". Press Ctrl+z to turn on 🎤 ", "info");
	textLogerln("Edit the Params.js file, and get ChatGPT to connect to your device first.", "info");
	userActive = true
}



document.addEventListener("click", function () {
	document.getElementById("prompt").focus(); // Auto-focus prompt input on Keydown event
});

document.addEventListener("keydown", keypressed);


function keypressed(event) {
	let prompt = document.getElementById("prompt");
	prompt.focus(); // Auto-focus prompt input on Keydown event

	if (userActive) {
		if (event.key == "Enter" || event == true) {
			// submit text
			submitPromt(prompt.value, "user");
		}
	}


	// turn sound on "Ctrl+z"
	if (event.key == "z" || event.key == "Z" && event.ctrlKey) {
		SpeechToText();
		textLogerln("speech recognition is " + ((chkSpeak) ? "on" : "off") + " 🎤 ");
	}
}



function submitPromt(input, role) {
	let prompt = document.getElementById("prompt");
	if (input != "") {
		textLogerln(input, role)
		userActive = false;
		let thinking = document.getElementById("thinking");
		thinking.style.display = "inline-block";
		prompt.style.display = "none"
		sendChatGPT(input, role).then((returnObject) => {
			// handle nested promises that might be returned
			recievedMessage(returnObject)
		}).catch(error => textLogerln(error.message, "assistant"));
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
		textLogerln(returnObject.message, returnObject.role)
		if (returnObject.role == "assistant") {
			TextToSpeech(returnObject.message);
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

function textLoger(string, agent) {
	let textBox = document.getElementById('history');
	try {
		// textBox.innerHTML += string;
		let currentLine;
		currentLine = document.createElement('span');
		currentLine.classList.add(agent);
		currentLine.innerHTML = string;
		textBox.appendChild(currentLine);
	} catch (e) {
		console.log(e)
	}
}

function textLogerln(string, agent) {
	textLoger(string, agent)
	textLoger('<br>', agent);
}
