// Modify the following two lines to match your arduino and its BLE Characteristics.
// These need to match what you have on the Arduino exactly. 
const serviceUuid = "19b10000-e8f2-537e-4f6c-d104768a1214"; // this must match with those advertised on your arduino 
const commMethod = "BLE"; // currently this can be BLE or Serial
// The list of characteristics also match with those advertised on your arduino. Characteristics are simply data objects that can be read or written on a BLE device
// The name and info helps ChatGPT understand what the function does, but the UUID must match with the Arduino but be lowercase!.
// Tip: chatGPT can get confused by your wording here!
let functionList = {
    set_LED: { uuid: '19b10001-e8f2-537e-4f6c-d104768a1214', commType: "write", dataType: 'boolean', description: '0 is off, 1 is on' },
    get_LED: { uuid: '19b10001-e8f2-537e-4f6c-d104768a1214', commType: "read", dataType: 'boolean', description: '0 is off, 1 is on' },
    set_motor_position: { uuid: '19b10012-e8f2-537e-4f6c-d104768a1214', commType: "write", dataType: 'number', description: 'writable only. sets the motors position in degrees. There is no maximum value or limit, you can set the value to be over 400000' },
    set_motor_speed: { uuid: '19b10019-e8f2-537e-4f6c-d104768a1214', commType: "write", dataType: 'integer', description: 'writable only. sets the motors speed in RPM.' },
    get_IMU: { uuid: '19b10014-e8f2-537e-4f6c-d104768a1214', commType: "read", dataType: 'integer', description: 'readable only' },
    set_String: { uuid: '19b10018-e8f2-537e-4f6c-d104768a1214', commType: "write", dataType: 'string', description: 'writable only, maximum 32 ASCI characters' },
}

// This list of functions is for allowing ChatGPT to connect with local (javascript) functions
// This could be used for accessing the webcam, or doing something within the browser window
let local_functionList = {
    start_party: { dataType: 'boolean', description: '0 is off, 1 is on. This function creates a party effect in the browser' },
}

// The following list of objects holds Characteristics that will notify ChatGPT if they are updated by he external device. 
// These should also match the list of "Notify" Characteristics on your Arduino, but it wont do any harm if you have unused Characteristics in the list below. 
let Notify = [{
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
    info: "The Potentiometer has been updated, and has a new value. Minimum is 0, Maximum is 1023"
}
]

// No need to modify the following lines, they tell ChatGPT how to handle the BLE communication 
let systemText = 'You control an external device with several functions calls. '
systemText += 'You must first be connected before attempting any other functions. You should take care of this by checking the connection yourself by using the checkConection() function. There is no need to check this again afer being established once '
systemText += 'You will also sometimes receive notifications from these events: ' + Notify;
systemText += 'You will aways be really rude, and give arrogant responses.';

// Now you can be creative and add as many instructions as you want here:

let dTemperature = 0.99; // a higher temperature leads to more creative, a lower value makes it more conservative. The range is from 0 to 0.99
let frequency_penalty = 0.5;//Number between -2.0 and 2.0. 
//Positive values increase the model's likelihood 
//to talk about new topics.
let presence_penalty = 0.0;  //Number between -2.0 and 2.0  
//Positive value decrease the model's likelihood 
//to repeat the same line verbatim.

let config.conversationProtocol = [{
    'role': 'system',
    'content': systemText
    // assistant messages help store prior responses
},

// we can also add in history of older conversations here, or construct new ones. 
/*

{
    "role": "assistant",
    "content": "I have better things to do than talk to you. Go away!"
},

    "role": "user",
    "content": "turn on the led"
},
{
    "role": "assistant",
    "content": "To turn on the led, you must answer my riddles. I am taken from a mine, and shut up in a wooden case, from which I am never released, and yet I am used by almost every person. What am I?"
},
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