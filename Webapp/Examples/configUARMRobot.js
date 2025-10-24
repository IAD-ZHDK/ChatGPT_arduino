const notifications = [
  {
    name: "star_pressed",
    type: "boolean", // possible values are "boolean" and "int"
    info: "* has been pressed on the keyboard. Sing a song about the Zurich Univesity of the Arts.",
  },
  // add more notifications here based on some custom functions
];

const local_functionList = {
    start_party: {
      dataType: "boolean",
      description: "0 is off, 1 is on. Creates a party effect in the browser",
    },
    // add other custom functions here
  }

const config = {
  
  chatGPTSettings: {
    temperature: 0.99,//Number between -2.0 and 2.0 //Positive value decrease the model's likelihood to repeat the same line verbatim.
    frequency_penalty: 0.5, //Number between -2.0 and 2.0. //Positive values increase the model's likelihood to talk about new topics.
    presence_penalty: 0.0, //Number between -2.0 and 2.0. //Positive values increase the model's likelihood to generate words and phrases present in the input prompt
    model: "gpt-4o-mini", //gpt-4o-mini, gpt-4o, gpt-4, gpt-3.5-turbo
    max_tokens: 2048, //Number between 1 and 8192. //The maximum number of tokens to generate in the completion. The token count of your prompt plus max_tokens cannot exceed the model's context length. Most models have a context length of 8192 tokens (except for the newest models, which can support more than 128k tokens).
    user_id: "1", //A unique identifier for the user. //This is used to track the usage of the API.
    url: "https://api.openai.com/v1/chat/completions", // gpt-4 is "https://api.openai.com/v1/completions";
  },

  communicationMethod: "Serial", // or "BLE"
  serviceUuid: "19b10000-e8f2-537e-4f6c-d104768a1214", // Only needed for BLE

  // The list of functions should match those set up on the arduino 
  functionList: {
    move_robot_to_default: {
      commType: "writeRaw",
      dataType: "string",
      defaultValue: "G2201 S215 R107 H100 F10000",
      description: "Send the robot to it's home/default position with the command 'G2201 S215 R90 H100 F10000'",
    },
    rotate_to: {
      commType: "writeRaw",
      dataType: "string",
      description: "rotate to the left or right depending on the users wish, but changing the R### to be lower for left and higher for right. For example, this would be the furthest left 'G2201 S215 R0 H100 F10000'",
    },
    moveHigher: {
      commType: "writeRaw",
      dataType: "string",
      description: "Increase the hight value H### by 10. For example, this would be 'G2201 S215 R107 H110 F10000' if the last command was 'G2201 S215 R107 H100 F10000'",
    },
    moveLower: {
      commType: "writeRaw",
      dataType: "string",
      description: "Decrease the hight value H### by 10. For example, this would be 'G2201 S215 R107 H90 F10000' if the last command was 'G2201 S215 R107 H100 F10000'",
    },
    start_suction: {
      commType: "writeRaw",
      dataType: "string",
      description: "Start the robots suction compressor with the command'M2231 V1'",
    },
    stop_suction: {
      commType: "writeRaw",
      dataType: "string",
      description: "Stop the robots suction compressor with the command'M2231 V0'",
    }
  },

  local_functionList: local_functionList,
  notifications: notifications,

  // assistant messages help store prior responses
  conversationProtocol: [
    {
      role: "system",
      content: `You control an externaly connected robot. 
      You must first be connected before attempting any other functions.
      You will also sometimes receive notifications from events ${JSON.stringify(notifications )}.
      Keep your answers short and too the point.
      You can send commands to the robot in the form of G2201 S215 R107 H100 F10000, where
      S### is the stretch, R### is the rotation, H### is the height, and F#### is the speed
      Always send the full command, even if the user only wants to change one property
      Mostly use the maximum speed, unless the user wants otherwise
      The ground is indicated with height of H0.
      The maximum range of motion for the robot is: 
      minHeight = -50;
      maxHeight = 150;
      minStretch = 95;
      maxStretch = 330;
      maxAngle = 180;
  
      `
      ,
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
