
const serviceUuid = "19b10000-e8f2-537e-4f6c-d104768a1214";
let myCharacteristics = [];
let lastResponse;
let ledState = 0;
let inputbox;



function setup() {
	OnLoad();
	//SpeechToText();
	createCanvas(800, 800);
	// Create a 'Connect' button
	const connectButton = createButton('Connect BLE')
	connectButton.mousePressed(connectToBle);
	connectButton.position(20, 20);
	// led button
	
	const LEDSButton = createButton('LED Switch')
	LEDSButton.mousePressed(switchLED);
	LEDSButton.position(20, 100);
	
	const sendMessageChatGPT = createButton('Send Message')
	sendMessageChatGPT.mousePressed(sendGPT);
	sendMessageChatGPT.position(20, 40);
	
	inputbox = createInput();
  inputbox.position(20, 65);
}

function sendGPT() {
	const message = inputbox.value();
  	inputbox.value('');
	sendChatGPT(message, "user");
}


function draw() {
	background(100);
	textSize(16);
	fill(255);
	text(lastResponse, 0, 0, width, height); // Text wraps within 
}



function switchLED(value) {
	console.log("LED switched!")
	if (bleConnected) {
		ledState = 1 - ledState; // toggle value between 0 and 1
		writeToCharacteristic(myCharacteristics[0], ledState) // write to first Characteristic
	}
}

function connectToBle() {
	log('Requesting Bluetooth Device...');
	navigator.bluetooth.requestDevice({
			filters: [{
				services: [serviceUuid]
			}]
		})
		.then(device => {
			console.log('Connecting to GATT Server...');
			return device.gatt.connect();
		})
		.then(server => {
			console.log('Getting Service...');
			return server.getPrimaryService(serviceUuid);
		})
		.then(service => {
			bleConnected = true;
			console.log('Getting all Characteristics...');
			return service.getCharacteristics();
		})
		.then(characteristics => {
			for (const c in characteristics) {
				myCharacteristics.push(characteristics[c]);
				console.log('Getting all Notifications started');
				characteristics[c].startNotifications().then(_ => {
					characteristics[c].addEventListener('characteristicvaluechanged', handleNotifications);
				});
				console.log(characteristics[c]);
			}
		})
		.catch(error => {
			console.log('error: ' + error);
		});
}

function writeToCharacteristic(characteristic, value) {
	
	let bufferToSend = Int8Array.of(value);
	characteristic.writeValueWithResponse(bufferToSend)
		.then(_ => {
					console.log('> Characteristic changed to: ' + bufferToSend);
		})
		.catch(error => {
			log('Argh! ' + error);
		});
}

function handleNotifications(event) {
	// this is setup for getting IMU data from the arduino 
	let value = event.target.value;
	let x = value.getFloat32(0, true); // get the first 4 bytes 
	let y = value.getFloat32(4, true); // the next first 4 bytes
	let z = value.getFloat32(8, true); // the next first 4 bytes
}