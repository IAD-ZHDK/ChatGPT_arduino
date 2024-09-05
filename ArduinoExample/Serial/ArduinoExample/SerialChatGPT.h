#ifndef SERIALCHATGPT_H
#define SERIALCHATGPT_H

#include <Arduino.h>

// Define the structure for command functions
struct Command {
  String name;
  String dataType;
    union {
  void (*funcBool)(bool);
  void (*funcInt)(int);
  void (*funcFloat)(float);
  void (*funcString)(String);
  void (*funcVoid)();
     };
};

// Declare the command functions array
extern Command commandFunctions[];
extern const int numCommands; // Declare numCommands as an extern variable

// Function declarations
void processCommand(String command);
void notify(String name, String info);
void notify(String name, int info);
void notify(String name, float info);

// Function definitions
void processCommand(String command) {

  for (int i = 0; i < numCommands; ++i) {
    if (command.startsWith(commandFunctions[i].name)) {
      String arg = command.substring(commandFunctions[i].name.length());  // get everything folowing the command keyword
      if (commandFunctions[i].dataType == "bool") {
        bool argument = arg.toInt();
        if (arg == "True" || arg == "False") {
          argument = "True" ? 1 : 0;
        }
        if (arg == "true" || arg == "false") {
          argument = "true" ? 1 : 0;
        }
        commandFunctions[i].funcBool(argument);
      } else if (commandFunctions[i].dataType == "int") {
          //  Serial.println(commandFunctions[i].name);
        int argument = arg.toInt();
        commandFunctions[i].funcInt(argument);
      } else if (commandFunctions[i].dataType == "float") {
          //    Serial.println(commandFunctions[i].name);
        float argument = arg.toFloat();
        commandFunctions[i].funcFloat(argument);
      } else if (commandFunctions[i].dataType == "string") {
         //     Serial.println(commandFunctions[i].name);
        commandFunctions[i].funcString(arg);
      } else if (commandFunctions[i].dataType == "none") {
        //  Serial.println(commandFunctions[i].name);
          commandFunctions[i].funcVoid();
      }  
      else {
        Serial.println("dataType not found");
      }
      return;
    }
  }
  Serial.println("Failed: Unknown command");
}

void notify(String name, String info) {
  Serial.print(name);
  Serial.print(":");
  Serial.println(info);
}

void notify(String name, int info) {
  notify(name, String(info));
}

void notify(String name, float info) {
  notify(name, String(info));
}

#endif // SERIALFUNCTIONS_H