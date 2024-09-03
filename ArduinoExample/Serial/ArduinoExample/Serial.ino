
void processCommand(String command) {
  const int numCommands = sizeof(commandFunctions) / sizeof(commandFunctions[0]);
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
         Serial.println(argument);
        commandFunctions[i].funcBool(argument);
      } else if (commandFunctions[i].dataType == "int") {
        int argument = arg.toInt();
        commandFunctions[i].funcInt(argument);
      } else if (commandFunctions[i].dataType == "float") {
        float argument = arg.toFloat();
        commandFunctions[i].funcFloat(argument);
      } else if (commandFunctions[i].dataType == "string") {
        commandFunctions[i].funcString(arg);
      } else if (commandFunctions[i].dataType == "void") {
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

void notify(String name, bool info) {
  notify(name, String(info));
}
