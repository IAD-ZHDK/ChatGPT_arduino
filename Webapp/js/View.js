class View  {

    constructor() {

    }


 textLoger(string, agent) {
	console.log("logger:"+string);
	let textBox = document.getElementById('history');
	try {
		// textBox.innerHTML += string;
		const formattedString = string.replace(/\n/g, '<br>');
		let currentLine;
		currentLine = document.createElement('span');
		currentLine.classList.add(agent);
		currentLine.innerHTML = formattedString;
		textBox.appendChild(currentLine);
	} catch (e) {
		console.log(e)
	}
}

 textLogerln(string, agent) {
	this.textLoger(string, agent)
	this.textLoger('<br>', agent);
}


}
export default View;