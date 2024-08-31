
void processCommand(String command) {
    const int numCommands =  sizeof(commandFunctions) / sizeof(commandFunctions[0]);
    for (int i = 0; i < numCommands; ++i) {
        if (command.startsWith(commandFunctions[i].name)) {
            String arg = command.substring(commandFunctions[i].name.length()); // get everything folowing the command keyword
            if (commandFunctions[i].dataType == "bool" || commandFunctions[i].dataType == "int") {
                  bool argument = arg.toInt();
                  commandFunctions[i].funcBool(argument);
            } else if (commandFunctions[i].dataType == "float") {
                  float argument = arg.toFloat();
                  commandFunctions[i].funcFloat(argument);
            } else if (commandFunctions[i].dataType == "string") {
                  commandFunctions[i].funcString(arg);
            }
            return;
        }
    }
    Serial.println("Error: Unknown command");
}

void notify(String name, String info) {
  Serial.print(name);
  Serial.print("_");
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