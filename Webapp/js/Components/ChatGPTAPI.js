// based of https://www.codeproject.com/Articles/5350454/Chat-GPT-in-JavaScript
// look at https://platform.openai.com/docs/guides/gpt-best-practices/strategy-split-complex-tasks-into-simpler-subtasks

// check this for propoer formating of responses in json format- https://platform.openai.com/docs/guides/gpt/chat-completions-api c

class ChatGPTAPI {
  constructor(communicationMethod, localFunctions) {
    this.Url = config.chatGPTSettings.url;
    this.Model = config.chatGPTSettings.model;
    this.MaxTokens = config.chatGPTSettings.max_tokens;
    this.UserId = config.chatGPTSettings.user_id;
    this.ignoreSerial = false;
	  this.comMethod = communicationMethod;
	  this.localFunctions = localFunctions;
    // format all comm functions and add to chatGPTs function list

	this.formatAndAddFunctions(config.functionList);
	this.formatAndAddFunctions(config.local_functionList);
    console.log(this.additionalFunctions);
  }

  formatAndAddFunctions(list) {
    for (const key in list) {
      let newFunction = this.formatFunctions(list, key);
      this.additionalFunctions.push(newFunction);
    }
  }

  formatFunctions(list, key) {
    let newFunction = {
      name: "",
      description: "",
      parameters: {
        type: "object",
        properties: {
          value: {
            type: "",
            description: "",
          },
        },
      },
    };

    let name = key;
    let UUID = "";
    let dataType = "";
    let description = "";

    try {
      dataType = list[key].dataType;
    } catch (e) {
      console.log("type not defined!" + e);
    }

    try {
      UUID = list[key].UUID;
    } catch (e) {
      console.log("UUID not defined" + e);
    }
    try {
      description = list[key].description;
    } catch (e) {
      console.log("info not defined!" + e);
    }
    newFunction.name = name;
    newFunction.description = description;
    newFunction.parameters.properties.value.type = dataType;
    newFunction.parameters.properties.value.description = description;
    return newFunction;
  }

  getModel() {
    return this.Model;
  }

  send(sQuestion, role, funtionName) {
    return new Promise((resolve, reject) => {
      let sURL = this.Url;
      let sModel = this.Model;
      let sMaxTokens = this.MaxTokens;
      let sUserId = this.UserId;
      let sadditionalFunctions = this.additionalFunctions;
      let sComMethod = this.comMethod;

      let returnObject = {
        message: null,
        promise: null,
        role: "assistant",
      };

      if (sQuestion.toLowerCase().includes("ignore serial")) {
        this.ignoreSerial = true;
        console.log("Serial communication will be ignored for this session.");
      }

      if (sQuestion == "") {
        console.log("message content is emtpy!");
        return;
      }
      console.log("role: " + role + " is sending message: " + sQuestion);

      const oHttp = new XMLHttpRequest();

      oHttp.open("POST", sURL);
      oHttp.onerror = function (e) {
        returnObject.message =
          "Error fetching " + sURL + ", check internet connection";
        returnObject.role = "error";
        resolve(returnObject);
      };
      oHttp.setRequestHeader("Accept", "application/json");
      oHttp.setRequestHeader("Content-Type", "application/json");
      oHttp.setRequestHeader("Authorization", "Bearer " + OPENAI_API_KEY);

      oHttp.onreadystatechange = function () {
        console.log("ready:" + oHttp.readyState);
        if (oHttp.readyState === 4) {
          var oJson = {};
          try {
            oJson = JSON.parse(oHttp.responseText);
          } catch (e) {
            reject(new Error("Error: " + e.message));
          }
          console.log(oJson);
          if (oJson.error && oJson.error.message) {
            reject(new Error("Error: " + oJson.error.message));
          } else if (oJson.choices) {
            var s = "";
            if (oJson.choices[0].text) {
              s = oJson.choices[0].text;
            } else if (oJson.choices[0].message) {
              //GPT-4
              s = oJson.choices[0].message.content;
            }

            s = oJson.choices[0].message.content;

            if (oJson.choices[0].finish_reason == "function_call") {
              console.log(oJson.choices[0].message.function_call);

              config.conversationProtocol.push(oJson.choices[0].message); // add the models response to the history

              // we need to check if the function provided by LLM realy exist
              let functionName = oJson.choices[0].message.function_call.name;
              console.log("function_call, function name: " + functionName);
              const functionArguments = JSON.parse(
                oJson.choices[0].message.function_call.arguments
              );
              functionArguments.defaultValue = "nothing";
              console.log("arguments:", functionArguments);

              const method = sComMethod.getMethod(functionName);

              if (method || config.functionList.hasOwnProperty(functionName)) {
                let functionReturnPromise;

                if (this.ignoreSerial && functionName === "connect") {
                  console.log("Ignoring Serial connection attempt.");
                  returnObject.message =
                    "Serial connection ignored as requested.";
                  returnObject.role = "function";
                  resolve(returnObject);
                  return;
                }

                if (method) {
                  functionReturnPromise = method.call(
                    sComMethod,
                    functionArguments
                  ); // Call the method with arguments
                } else {
                  console.log(functionName + " exists in functionList!");
                  functionArguments.uuid = config.functionList[functionName].uuid;
                  functionArguments.dataType =
                    config.functionList[functionName].dataType;
                  functionArguments.name = functionName;

                  console.log("arguments: ");
                  console.log(functionArguments);
                  console.log(functionArguments.value);
                  if (
                    config.functionList[functionName].commType == "readWrite" ||
                    config.functionList[functionName].commType == "write"
                  ) {
                    const method = sComMethod.getMethod("write");
                    functionReturnPromise = method.call(
                      sComMethod,
                      functionArguments
                    ); // Call the method with arguments
                  } else if (config.functionList[functionName].commType == "writeRaw") {
                    const method = sComMethod.getMethod("writeRaw");
                    const newArgument =  String(functionArguments.value)
                    functionReturnPromise = method.call(
                      sComMethod,
                      newArgument
                    )
                  }else {
                    // read only
                    const method = sComMethod.getMethod("read");
                    functionReturnPromise = method.call(
                      sComMethod,
                      functionArguments
                    ); // Call the method with arguments
                  }
                }

                functionReturnPromise.then((functionReturnObject) => {
                  let formatedValue =
                    '{"' +
                    functionReturnObject.description +
                    '": "' +
                    functionReturnObject.value +
                    '"}';
                  console.log(functionReturnObject);
                  // we always need to send the value back to chatGPT
                  console.log(formatedValue);
                  console.log(functionName);
                  returnObject.promise = this.send(
                    formatedValue,
                    "function",
                    functionName
                  );
                  if (functionReturnObject.description == "Error") {
                    returnObject.message =
                      "function_call with error:" + functionReturnObject.value;
                    returnObject.role = "error";
                  } else {
                    returnObject.message = "function_call " + functionName;
                    returnObject.role = "function";
                  }
                  resolve(returnObject);
                });
              } else if (config.local_functionList.hasOwnProperty(functionName)) {
                // check if it's a local function
                this.callFunctionByName(
                  functionName,
                  functionArguments
                );
                returnObject.message = "function_call " + functionName + "";
                returnObject.role = "function";
                resolve(returnObject);
              } else {
                returnObject.message = "Error: function does not exist";
                returnObject.role = "error";
                resolve(returnObject);
              }
            }

            if (s == "" || s == null) {
              s = "No response";
            } else {
              // success!
              console.log("success");
              returnObject.message = s;
              // add the AI response to the protocol
              config.conversationProtocol.push({
                role: "assistant",
                content: s,
              });
              console.log(returnObject)
              resolve(returnObject);
            }
          }
        }
      }.bind(this);

      let data = {
        model: sModel,
        max_tokens: sMaxTokens,
        user: sUserId,
        temperature: config.chatGPTSettings.temperature,
        frequency_penalty: config.chatGPTSettings.frequency_penalty, 
        presence_penalty: config.chatGPTSettings.presence_penalty, 
        stop: ["#", ";"], //Up to 4 sequences where the API will stop generating
        //further tokens. The returned text will not contain
        //the stop sequence.
        functions: sadditionalFunctions,
        messages: config.conversationProtocol,
      };

      // add lattest prompt to protocal
      if (funtionName) {
        config.conversationProtocol.push({
          role: role,
          name: funtionName,
          content: sQuestion,
        });
      } else {
        config.conversationProtocol.push({
          role: role,
          content: sQuestion,
        });
      }
      // TODO: need to fix error handling if there is too many tokens or no internet
      try {
        oHttp.send(JSON.stringify(data));
        console.log("sending data to chatGPT", data);
      } catch (e) {
        returnObject.message =
          "Error fetching " + this.Url + ", check internet connection";
        returnObject.role = "error";
        resolve(returnObject);
      }
    });
  }

  additionalFunctions = [
    {
      name: "checkConection",
      description: "check if the connection is turned on",
      parameters: {
        type: "object",
        properties: {
          value: {
            type: "integer",
            description: "no paramaters are needed",
          },
        },
      },
    },
    {
      name: "connect",
      description: "connect to external device",
      parameters: {
        type: "object",
        properties: {
          value: {
            type: "boolean",
            description: "mandatory property, has no impact on return value",
          },
        },
      },
    },
  ];


  callFunctionByName(functionName, args) {
    console.log(args);
    if (this.localFunctions[functionName] && typeof this.localFunctions.executeFunction === 'function') {
		console.log("local function found");
      return this.localFunctions.executeFunction(functionName, args);
      // Handle local functions that are not part of jsFunctions
      // We should refactor this part in the future
	} else if (typeof window[functionName] === 'function') { 
	  return window[functionName](args);
    } else {
      console.error(`Function ${functionName} not found`);
    }
  }
}

export default ChatGPTAPI;
