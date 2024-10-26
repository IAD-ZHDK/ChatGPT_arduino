import VisionAPI from './Components/VisionAPI.js';

let video;
let captureButton;
let inquiryButton;
let generateButton;
let gptVisionText;
let base64Image;
let canvas = document.querySelector('#image-capture');
let context = canvas.getContext('2d');
let img = document.querySelector('#generatedImage');
let localFunctions = null;


document.addEventListener('DOMContentLoaded', () => {
    enableCamera();

    captureButton = document.getElementById('capture');
    captureButton.addEventListener('click', captureImage);

    inquiryButton = document.getElementById('inquiry');
    inquiryButton.addEventListener('click', getVisionResult);
    inquiryButton.disabled = true;

    generateButton = document.getElementById('generate');
    generateButton.addEventListener('click', generateImage);
    generateButton.disabled = true;
    
    gptVisionText = document.getElementById('gpt-vision-text');
    gptVisionText.textContent = 'GPT Vision';

});


function hasGetUserMedia() {
	return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

function enableCamera(){
    let constraints = { video : true };
    navigator.mediaDevices.getUserMedia(constraints)
    .then(() => {
        setCamera();
    })
    .catch(() => {
        alert("Camera permisison is denied!");
    });
}

function setCamera() {
	let constraints = {
        video: true,
        audio: false
	};

	navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
		video = document.querySelector('#webcam');
		video.srcObject = stream;
		video.play();
	});
}


function captureImage() {
    if (captureButton.textContent === "Capture") {
        img.style.display = "none"
        inquiryButton.disabled = false;
        generateButton.disabled = false;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 15, canvas.width, canvas.height * 0.938);
        const dataUrl = canvas.toDataURL('image/jpg');
        base64Image = dataUrl.split(',')[1];
        captureButton.textContent = "Recapture";
       
    } else {
        // If the button says "Recapture", clear the canvas
        context.clearRect(0, 0, canvas.width, canvas.height);
        captureButton.textContent = "Capture";
        inquiryButton.disabled = true;
        generateButton.disabled = true;
    }
}

async function getVisionResult() {
    gptVisionText.textContent = 'Processing...';
    captureButton.disabled = true;
    generateButton.disabled = true;

    const visionAPI = new VisionAPI();
    try {
        const result = await visionAPI.saveImage(base64Image);
    } catch (error) {
        console.error('Failed to process image:', error);
    } finally {
        context.clearRect(0, 0, canvas.width, canvas.height);      
        captureButton.disabled = false;
        generateButton.disabled = false;
        captureButton.textContent = "Capture";
    }
}


async function generateImage() {
    gptVisionText.textContent = 'Generating...';
    captureButton.disabled = true;
    inquiryButton.disabled = true;

    const visionAPI = new VisionAPI();
    try {
        const result = await visionAPI.sendToDalle(base64Image);
    } catch (error) {
        console.error('Failed to generate image:', error);
    } finally {
        context.clearRect(0, 0, canvas.width, canvas.height);
        captureButton.disabled = false;
        inquiryButton.disabled = false;
        captureButton.textContent = "Capture";
    }
}
