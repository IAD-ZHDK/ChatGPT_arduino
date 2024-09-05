// These need to match what you have on the Arduino exactly. 
const commMethod = "Serial"; // currently this can be BLE or Serial
// The list of functions should match those set up on the arduino 
let functionList = {
    set_LED: {commType: "write", dataType: 'boolean', description: '0 is off, 1 is on' },
    get_LED: {commType: "read", dataType: 'boolean', description: '0 is off, 1 is on' },
    set_motor_position: { commType: "write", dataType: 'number', description: 'writable only. sets the motors position in degrees. There is no maximum value or limit, you can set the value to be over 400000' },
    set_motor_speed: { commType: "write", dataType: 'integer', description: 'writable only. sets the motors speed in RPM.' },
    get_IMU: {commType: "read", dataType: 'integer', description: 'readable only' },
    set_String: {commType: "write", dataType: 'string', description: 'writable only, maximum 32 ASCI characters' },
    get_String: {commType: "read", dataType: 'string', description: 'readable only, maximum 32 ASCI characters' },
}

// The following list of objects holds functions that will notify ChatGPT if they are updated 
// These should also match the functions setu on your Arduino, but it wont do any harm if you have unused functions in the list below. 
let Notify = [{
    name: 'shake', // the arduino example is setup to make a BLE notification if it is shaken.
    type: "boolean", // possible values are "boolean" and "int"
    checkOn: "change", // When chatGPT should be informed of change of boolean. possible values: 'rise', 'fall', 'change'. Only applicable to boolean values.
    info: "The device has been shaken!"
},
{
    name: 'Potentiometer',
    type: "int", // possible values are "boolean" and "int"
    info: "The Potentiometer has been updated, and has a new value. Minimum is 0, Maximum is 1023"
},
// note, the folowing notification example is trigered by the code running in the browser. This requires modification of the code in the JsFunctions.js file 
{
    name: 'star_pressed',
    type: "boolean", // possible values are "boolean" and "int"
    info: "* has been pressed on the keyboard. Sing a song about the Zurich Univesity of the Arts."
}
]

// This list of functions is for allowing ChatGPT to connect with local (javascript) functions
// This could be used for accessing the webcam, or doing something within the browser window
let local_functionList = {
    start_party: { dataType: 'boolean', description: '0 is off, 1 is on. This function creates a party effect in the browser' },
}

// No need to modify the following lines, they tell ChatGPT how to handle the BLE communication 
let systemText = 'You control an external device with several functions calls. '
systemText += 'You must first be connected before attempting any other functions. You should take care of this by checking the connection yourself by using the checkConection() function. There is no need to check this again afer being established once '
systemText += 'You will also sometimes receive notifications from these events: ' + JSON.stringify(Notify);
systemText += 'You will be very helpful, and offer advice is the api doesnt work as expected.';

// Now you can be creative and add as many instructions as you want here:

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
