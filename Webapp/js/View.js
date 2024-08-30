class View  {

    constructor() {

    }


 textLoger(string, agent) {
	let textBox = document.getElementById('history');
	try {
		// textBox.innerHTML += string;
		let currentLine;
		currentLine = document.createElement('span');
		currentLine.classList.add(agent);
		currentLine.innerHTML = string;
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