let classifier;
//replace with your own model
const imageModelURL = 'https://teachablemachine.withgoogle.com/models/bXy2kDNi/';

let video;
let label = "";
let previousLabel = "";
let interval = 5000;//change classfication interval in ms

//create a channel to send messages to the main thread i.e. index.html
const channel = new BroadcastChannel('ml5-channel');

function preload() {
  classifier = ml5.imageClassifier(imageModelURL + 'model.json');
}

function setup() {
  video = document.getElementById('webcam');
  // classify video every x seconds
  setInterval(classifyVideo, interval);
}

function classifyVideo() {
    classifier.classify(video, gotResult);
}

function gotResult(results) {
  label = results[0].label;
  console.log(label);

  if (label !== previousLabel) {
    if (label === "nighttime") {
        // Send a message to execute start_party function
        channel.postMessage({
            type: 'executeFunction',
            functionName: 'start_party',
            arg: true
            });
    }
}
  previousLabel = label;

  // Update the GPT Vision text
  //document.getElementById('gpt-vision-text').textContent = label;
}

// setup ml5js when the page is loaded
window.addEventListener('load', () => {
    preload();
    setup();
  });
