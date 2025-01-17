let voice = 1; // this can be used for defining the type of voice that is used for voice synthesis
const notifications = [
    
  {
    name: "shake",
    uuid: "19b10016-e8f2-537e-4f6c-d104768a1214", // Only needed for BLE
    type: "boolean",
    info: "The device has been shaken! Get really mad at the user!",
  },
  {
    name: "Potentiometer",
    uuid: "19b10036-e8f2-537e-4f6c-d104768a1214", // Only needed for BLE
    type: "int",
    info: "The Potentiometer has been updated. Min: 0, Max: 1023",
  },
  {
    name: "star_pressed",
    type: "boolean", // possible values are "boolean" and "int"
    info: "* has been pressed on the keyboard. Sing a song about the Zurich Univesity of the Arts.",
  },
  {
    name: "IMU_Data", 
    type: "GPT_ignore", // this is a special type of notification, that should be ignored by ChatGPT but the data should be made available in the browser
    info: "",
  },
  // add more notifications here based on some custom functions
];

const local_functionList = {
    start_party: {
      dataType: "boolean",
      description: "0 is off, 1 is on. Creates a party effect in the browser",
    },
    // add other custom functions here
    update_p5:{
      dataType: "string",
      description: "Update the p5.js sketch with custom message",
    },
    changeVoice:{
      dataType: "integer",
      description: "Change the type of voice in the speech synthesis.",
    }
  }

const config = {
  
  chatGPTSettings: {
    temperature: 0.99,//Number between -2.0 and 2.0 //Positive value decrease the model's likelihood to repeat the same line verbatim.
    frequency_penalty: 0.5, //Number between -2.0 and 2.0. //Positive values increase the model's likelihood to talk about new topics.
    presence_penalty: 0.0, //Number between -2.0 and 2.0. //Positive values increase the model's likelihood to generate words and phrases present in the input prompt
    model: "gpt-4o-mini", //gpt-4o-mini, gpt-4o, gpt-4, gpt-3.5-turbo
    max_tokens: 8192, //Number between 1 and 8192. //The maximum number of tokens to generate in the completion. The token count of your prompt plus max_tokens cannot exceed the model's context length. Most models have a context length of 8192 tokens (except for the newest models, which can support more than 128k tokens).
    user_id: "1", //A unique identifier for the user. //This is used to track the usage of the API.
    url: "https://api.openai.com/v1/chat/completions", // gpt-4 is "https://api.openai.com/v1/completions";
  },

  communicationMethod: "BLE", // or "BLE"
  serviceUuid: "19b10000-e8f2-537e-4f6c-d104768a1214", // Only needed for BLE

  // The list of functions should match those set up on the arduino 
  functionList: {
    set_LED: {
      uuid: "19b10001-e8f2-537e-4f6c-d104768a1214", // Only needed for BLE
      commType: "write",
      dataType: "boolean",
      description: "0 is off, 1 is on",
    },
    get_LED: {
      uuid: "19b10001-e8f2-537e-4f6c-d104768a1214", // Only needed for BLE
      commType: "read",
      dataType: "boolean",
      description: "0 is off, 1 is on",
    },
    set_motor_position: {
      uuid: "19b10012-e8f2-537e-4f6c-d104768a1214", // Only needed for BLE
      commType: "write",
      dataType: "number",
      description:
        "Sets the motors position in degrees. No maximum value or limit.",
    },
    set_motor_speed: {
      uuid: "19b10012-e8f2-537e-4f6c-d104768a1214", // Only needed for BLE
      commType: "write",
      dataType: "number",
      description: "Sets the motors speed in RPM.",
    },
    get_IMU: {
      uuid: "19b10012-e8f2-537e-4f6c-d104768a1214", // Only needed for BLE
      commType: "read",
    },
    set_String: {
      uuid: "19b10012-e8f2-537e-4f6c-d104768a1214", // Only needed for BLE
      commType: "write",
      dataType: "string",
      description: "Set a message on the device.",
    },
    get_String: {
      uuid: "19b10012-e8f2-537e-4f6c-d104768a1214", // Only needed for BLE
      commType: "read",
      dataType: "string",
      description: "Get the string from the device.",
    },
  },

  local_functionList: local_functionList,
  notifications: notifications,

  // assistant messages help store prior responses
  conversationProtocol: [
    {
      role: "system",
      content: `You control an external device with several functions calls. Try connecting again if there is any trouble with the functions. You will also sometimes receive notifications from events ${JSON.stringify(notifications )}.You will be very helpful, and offer advice is the api doesnt work as expected.`,
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
  ],
};
