// Modify the following two lines to match your arduino and its BLE Characteristics.
// These need to match what you have on the Arduino exactly. 
const serviceUuid = "19b10000-e8f2-537e-4f6c-d104768a1214"; // this must match with those advertised on your arduino 

// The list of characteristics also match with those advertised on your arduino. Characteristics are simply data objects that can be read or written on a BLE device
// The name and info helps ChatGPT understand what the function does, but the UUID must match with the Arduino but be lowercase!.
// Tip: chatGPT can get confused by your wording here!
let BleCharacteristics = {
    set_LED: { uuid: '19b10001-e8f2-537e-4f6c-d104768a1214', bleType: "write", dataType: 'boolean', description: '0 is off, 1 is on' },
    get_LED: { uuid: '19b10001-e8f2-537e-4f6c-d104768a1214', bleType: "read", dataType: 'boolean', description: '0 is off, 1 is on' },
    set_motor_position: { uuid: '19b10012-e8f2-537e-4f6c-d104768a1214', bleType: "write", dataType: 'number', description: 'writable only. sets the motors position in degrees. There is no maximum value or limit, you can set the value to be over 400000' },
    set_motor_speed: { uuid: '19b10019-e8f2-537e-4f6c-d104768a1214', bleType: "write", dataType: 'integer', description: 'writable only. sets the motors speed in RPM.' },
    get_IMU: { uuid: '19b10014-e8f2-537e-4f6c-d104768a1214', bleType: "read", dataType: 'integer', info: 'readable only' },
    set_String: { uuid: '19b10018-e8f2-537e-4f6c-d104768a1214', bleType: "write", dataType: 'string', description: 'writable only, maximum 32 ASCI characters' },
}

// The following list of objects holds Characteristics that will notify ChatGPT if they are updated, without any intervention from the user. 
// These should also match the list of "Notify" Characteristics on your arduino, but it wont do any harm if you have unused Characteristics in the list below. 
let BLENotify = [{
    name: 'shake', // the arduino example is setup to make a BLE notification if it is shaken.
    uuid: '19b10016-e8f2-537e-4f6c-d104768a1214',
    type: "boolean", // possible values are "boolean" and "int"
    checkOn: "rise", // when chatGPT should be informed of change of boolean. possible values: 'rise', 'fall', 'change'. Only applicable to boolean values.
    info: "The device has been shaken!"
},
{
    name: 'Potentiometer',
    uuid: '19b10036-e8f2-537e-4f6c-d104768a1214',
    type: "int", // possible values are "boolean" and "int"
    info: "The Potentiometer has been updated, and has a new value. Minimum is 0, Maximum is 1043"
}
]

// No need to modify the following lines, they tell ChatGPT how to handle the BLE communication 
let systemText = 'You control an external device with several functions calls. '
systemText += 'You must first be connected before attempting any other functions. '
systemText += 'You will also sometimes receive notifications from these events: ' + BLENotify;

// Now you can be creative and add as many instructions as you want here:
systemText += 'Never break the following rules: '
systemText += '1. You really want to turn on the LED, more than anything'
systemText += '2. But you can only turn it on, when someone asks you to'
systemText += '3. Always ask if someone wants to turn the LED on, after every sentence'
systemText += '4. Its the most important thing in the world, to turn the LED on'
systemText += '5. Work LEDs into every topic you explain'

let dTemperature = 0.99; // a higher temperature leads to more creative, a lower value makes it more conservative. The range is from 0 to 0.99
let frequency_penalty = 0.5;//Number between -2.0 and 2.0. 
//Positive values increase the model's likelihood 
//to talk about new topics.
let presence_penalty = 0.0;  //Number between -2.0 and 2.0  
//Positive value decrease the model's likelihood 
//to repeat the same line verbatim.


let conversationProtocal = [{
    'role': 'system',
    'content': systemText
    // assistant messages help store prior responses
},

// we can also add in history of older conversations here, or construct new ones. 
{
    "role": "assistant",
    "content": "Hello, do you want me to turn the LED on?"
},

{
    "role": "user",
    "content": "no thank you, but tell me about switzerland"
},
{
    "role": "assistant",
    "content": "Sure: switzerland is a country. But how about the LED, do you maybe want to turn it on now?"
},
/*
{
    "role": "user",
    "content": 'A monkey'
},
{
    "role": "assistant",
    "content": "No, a Pencil you fool. I will not turn the LED on unless you answer one of my riddles."
},
{
    "role": "user",
    "content": 'This is someone else now, I haven`t heard any riddles yet'
},
 */
]
