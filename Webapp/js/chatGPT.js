// based of https://www.codeproject.com/Articles/5350454/Chat-GPT-in-JavaScript
// look at https://platform.openai.com/docs/guides/gpt-best-practices/strategy-split-complex-tasks-into-simpler-subtasks

// check this for propoer formating of responses in json format- https://platform.openai.com/docs/guides/gpt/chat-completions-api c

let txtOutputVal = "";
let sUrl = "https://api.openai.com/v1/chat/completions" // gpt-4 is "https://api.openai.com/v1/completions";
let sModel = "gpt-3.5-turbo";


function setupChatGPTFunctions() {
	// format all BleCharacteristics and add to chatGPTs function list

	for (const key in BleCharacteristics) {

		let newFunction = {
			"name": "",
			"description": "",
			"parameters": {
				"type": "object",
				"properties": {
					"value": {
						"type": "",
						"description": "",
					},
				}
			},
		};

		let bleName = key
		let UUID = ""
		let dataType = ""
		let description = ""

		try {
			dataType = BleCharacteristics[key].dataType
		} catch (e) {
			console.log("type not defined!" + e);
		}

		try {
			UUID = BleCharacteristics[key].UUID
		} catch (e) {
			console.log("UUID not defined!" + e);
		}
		try {
			description = BleCharacteristics[key].description
		} catch (e) {
			console.log("info not defined!" + e);
		}
		newFunction.name = bleName
		newFunction.description = description
		newFunction.parameters.properties.value.type = dataType
		newFunction.parameters.properties.value.description = description

		// add new function to list
		functionList.push(newFunction)
	}

}

function sendChatGPT(sQuestion, role, funtionName) {

	return new Promise(function (resolve, reject) {
		let returnObject = {
			message: null,
			promise: null,
			role: "assistant",
		}

		if (sQuestion == "") {
			alert("Type in your question!");
			return;
		}
		console.log("sending message: " + sQuestion);
		console.log("role: " + role);
		var oHttp = new XMLHttpRequest();
		oHttp.onerror = function (e) {
			returnObject.message = "Error fetching " + sUrl + ", check internet connection";
			returnObject.role = "error"
			resolve(returnObject);
		};
		oHttp.open("POST", sUrl);
		oHttp.setRequestHeader("Accept", "application/json");
		oHttp.setRequestHeader("Content-Type", "application/json");
		oHttp.setRequestHeader("Authorization", "Bearer " + OPENAI_API_KEY)

		oHttp.onreadystatechange = function () {
			console.log("ready:" + oHttp.readyState)
			if (oHttp.readyState === 4) {
				//console.log(oHttp.status);
				var oJson = {}
				try {
					oJson = JSON.parse(oHttp.responseText);
				} catch (e) {
					//txtOutputVal += "Error: " + ex.message
					reject(new Error("Error: " + e.message));
				}
				console.log(oJson)
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

						console.log(oJson.choices[0].message.function_call)

						let functionName = oJson.choices[0].message.function_call.name;
						console.log("function_call, function name: " + functionName);
						const arguments = JSON.parse(oJson.choices[0].message.function_call.arguments);
						arguments.defaultValue = "nothing";
						console.log("arguments:", arguments);
						let functionReturnPromise
						if (typeof eval("functionHandler." + functionName) === "function") {
							//a matching function was found
							console.log(">  function exists: " + functionName);
							console.log(">  function arguments: " + arguments)
							functionReturnPromise = functionHandler[functionName](arguments); // the call to the function
							functionReturnPromise.then(functionReturnObject => {
								let formatedValue = '{\"' + functionReturnObject.description + '\": "' + functionReturnObject.value + '"}'
								console.log(functionReturnObject)
								// we always need to send the value back to chatGPT
								returnObject.promise = sendChatGPT(formatedValue, 'function', functionName)
								if (functionReturnObject.description == "Error") {
									returnObject.message = "function_call with error:" + functionReturnObject.value;
									returnObject.role = "error"
								} else {
									returnObject.message = "function_call"
									returnObject.role = "function"
								}
								resolve(returnObject);
							})
						} else if (BleCharacteristics.hasOwnProperty(functionName)) {
							// this is for BLE functions defined in params.js 

							console.log(functionName + " exists in BleCharacteristics!")
							console.log("arguments: " + arguments)
							arguments.uuid = BleCharacteristics[functionName].uuid
							arguments.dataType = BleCharacteristics[functionName].dataType
							let functionReturnPromise;
							if (BleCharacteristics[functionName].bleType == "readWrite" || BleCharacteristics[functionName].bleType == "write") {
								functionReturnPromise = functionHandler["write_to_Device"](arguments)
							} else {
								// read only 
								functionReturnPromise = functionHandler["get_device_property"](arguments)
							}

							functionReturnPromise.then(functionReturnObject => {
								let formatedValue = '{\"' + functionReturnObject.description + '\": "' + functionReturnObject.value + '"}'
								console.log(functionReturnObject)
								// we always need to send the value back to chatGPT
								returnObject.promise = sendChatGPT(formatedValue, 'function', functionName)
								if (functionReturnObject.description == "Error") {
									returnObject.message = "function_call with error:" + functionReturnObject.value;
									returnObject.role = "error"
								} else {
									returnObject.message = "function_call"
									returnObject.role = "function"
								}
								resolve(returnObject);
							})

						} else {
							returnObject.message = "Error: function does not exist";
							returnObject.role = "error"
							resolve(returnObject);
						}
					}

					if (s == "" || s == null) {
						s = "No response";
					} else {
						// success!
						console.log("success")
						returnObject.message = s
						// add the AI response to the protocol
						conversationProtocal.push({
							"role": "assistant",
							"content": s
						});
						resolve(returnObject);
					}
				}
			}
		};

		let iMaxTokens = 2048;
		let sUserId = "1";

		console.log(conversationProtocal);
		let data = {
			model: sModel,
			max_tokens: iMaxTokens,
			user: sUserId,
			temperature: dTemperature,
			frequency_penalty: frequency_penalty, //Number between -2.0 and 2.0  
			//Positive value decrease the model's likelihood 
			//to repeat the same line verbatim.
			presence_penalty: presence_penalty, //Number between -2.0 and 2.0. 
			//Positive values increase the model's likelihood 
			//to talk about new topics.
			stop: ["#", ";"], //Up to 4 sequences where the API will stop generating 
			//further tokens. The returned text will not contain 
			//the stop sequence.
			functions: functionList,
			messages: conversationProtocal
		}

		// add lattest prompt to protocal
		if (funtionName) {
			conversationProtocal.push({
				"role": role,
				"name": funtionName,
				"content": sQuestion
			});
		} else {
			conversationProtocal.push({
				"role": role,
				"content": sQuestion
			});
		}

		//chat GPT-4 gpt-4
		/*
		if (sModel.indexOf("gpt-3.5-turbo") != -1) {
			data = {
				"messages": conversationProtocal
			}
		}
		*/

		// TODO: need to fix error handling if there is too many tokens or no internet
		try {
			oHttp.send(JSON.stringify(data));
		} catch (e) {
			returnObject.message = "Error fetching " + sUrl + ", check internet connection";
			returnObject.role = "error"
			resolve(returnObject);
		}

	})
}


let functionList = [

	{
		"name": "checkConection",
		"description": "check if the connection is turned on",
		"parameters": {
			"type": "object",
			"properties": {
				"value": {
					"type": "integer",
					"description": "no paramaters are needed",
				},
			}
		},
	},
	{
		"name": "connectToDevice",
		"description": "connect to external device",
		"parameters": {
			"type": "object",
			"properties": {
				"value": {
					"type": "boolean",
					"description": "mandatory property, has no impact on return value",
				},
			}
		},
	},

];