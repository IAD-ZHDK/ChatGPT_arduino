let channel;
let receivedMessage;

function setup() {
  createCanvas(windowWidth, windowHeight);

    // Initialize BroadcastChannel
    channel = new BroadcastChannel('example_channel');

    // Listen for messages from other windows
    channel.onmessage = (event) => {
        console.log('Received message:', event.data);
        receivedMessage = event.data.value;
        console.log(receivedMessage);
    };
}

function draw() {
  background(0);
  translate(width / 2, height / 2); // Move the origin to the center of the canvas

  let radius = 100; // Radius of the circle
  let angle = frameCount * 0.05; // Angle for the sine wave animation

  // Draw the circle
  stroke(255);
  noFill();
  ellipse(0, 0, radius * 2, radius * 2);

  // Calculate the x and y positions using sine and cosine functions
  let x = radius * cos(angle);
  let y = radius * sin(angle);

  // Draw the moving point on the circle
  fill(255, 0, 0);
  noStroke();
  ellipse(x, y, 10, 10);
}

function sendMessage(message) {
  channel.postMessage({ type: 'update', value: message });
}