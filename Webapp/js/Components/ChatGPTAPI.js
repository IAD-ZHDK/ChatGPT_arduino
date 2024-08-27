// based of https://www.codeproject.com/Articles/5350454/Chat-GPT-in-JavaScript
// look at https://platform.openai.com/docs/guides/gpt-best-practices/strategy-split-complex-tasks-into-simpler-subtasks

// check this for propoer formating of responses in json format- https://platform.openai.com/docs/guides/gpt/chat-completions-api c





class ChatGPTAPI {
    constructor(communicationMethod) {
		this.Url = "https://api.openai.com/v1/chat/completions" // gpt-4 is "https://api.openai.com/v1/completions";
		this.Model = "gpt-4o-mini";
		this.comMethod = communicationMethod;
		this.MaxTokens = 2048;
		this.UserId = "1";
		// format all functionList and add to chatGPTs function list

		for (const key in functionList) {
	
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
	
			let name = key
			let UUID = ""
			let dataType = ""
			let description = ""
	
			try {
				dataType = functionList[key].dataType
			} catch (e) {
				console.log("type not defined!" + e);
			}
	
			try {
				UUID = functionList[key].UUID
			} catch (e) {
				console.log("UUID not defined" + e);
			}
			try {
				description = functionList[key].description
			} catch (e) {
				console.log("info not defined!" + e);
			}
			newFunction.name = name
			newFunction.description = description
			newFunction.parameters.properties.value.type = dataType
			newFunction.parameters.properties.value.description = description
	
			// add new function to list
			this.additionalFunctions.push(newFunction)
		}
	}

	getModel() {
        return this.Model;
    }

	
	send(sQuestion, role, funtionName) {
		// there is an error with scope when this is called recurrently 
		return new Promise((resolve, reject) => {
			let sURL = this.Url
			let sModel = this.Model
			let sMaxTokens = this.MaxTokens
			let sUserId =  this.UserId
			let sadditionalFunctions = this.additionalFunctions
			let sComMethod = this.comMethod
			
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

			const oHttp = new XMLHttpRequest();

			oHttp.open("POST", sURL);
			oHttp.onerror = function (e) {
				returnObject.message = "Error fetching " + sURL + ", check internet connection";
				returnObject.role = "error"
				resolve(returnObject);
			};
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
	
							// we need to check if the function provided by LLM realy exist
							let functionName = oJson.choices[0].message.function_call.name;
							console.log("function_call, function name: " + functionName);
							const functionArguments = JSON.parse(oJson.choices[0].message.function_call.arguments);
							functionArguments.defaultValue = "nothing";
							console.log("arguments:", functionArguments);

							const method = sComMethod.getMethod(functionName);
							
							if (method || functionList.hasOwnProperty(functionName)) {
	
								let functionReturnPromise;
	
								if (method) {
									functionReturnPromise = method.call(sComMethod, functionArguments); // Call the method with arguments
								} else {
									console.log(functionName + " exists in functionList!")
									console.log("arguments: ")
									console.log(functionArguments)
									functionArguments.uuid = functionList[functionName].uuid
									functionArguments.dataType = functionList[functionName].dataType
									if (functionList[functionName].commType == "readWrite" || functionList[functionName].commType == "write") {
										const method = sComMethod.getMethod("write");
										functionReturnPromise =  method.call(sComMethod, functionArguments); // Call the method with arguments
									} else {
										// read only 
										const method = sComMethod.getMethod("read");
										functionReturnPromise =  method.call(sComMethod, functionArguments); // Call the method with arguments
									}
	
								}
							
								functionReturnPromise.then(functionReturnObject => {
									let formatedValue = '{\"' + functionReturnObject.description + '\": "' + functionReturnObject.value + '"}'
									console.log(functionReturnObject)
									// we always need to send the value back to chatGPT
									console.log(formatedValue);
									console.log(functionName);
									returnObject.promise = this.send(formatedValue, 'function', functionName)
									if (functionReturnObject.description == "Error") {
										returnObject.message = "function_call with error:" + functionReturnObject.value;
										returnObject.role = "error"
									} else {
										returnObject.message = "function_call " + functionName
										returnObject.role = "function"
									}
									resolve(returnObject);
								})
							}  else {
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
			}.bind(this);
	

			let data = {
				model: sModel,
				max_tokens: sMaxTokens,
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
				functions: sadditionalFunctions,
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
			// TODO: need to fix error handling if there is too many tokens or no internet
			try {
				oHttp.send(JSON.stringify(data));				
			} catch (e) {
				returnObject.message = "Error fetching " + this.Url + ", check internet connection";
				returnObject.role = "error"
				resolve(returnObject);
			}
	
		})
	}

	 
	
	
	additionalFunctions = [
	
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
			"name": "connect",
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

}


export default ChatGPTAPI;