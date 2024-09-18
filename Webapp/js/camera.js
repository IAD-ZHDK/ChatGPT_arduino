import VisionAPI from './Components/VisionAPI.js';

let video;
let canvas;
let context;
let captureButton;
let inquiryButton;
let base64Image;


document.addEventListener('DOMContentLoaded', () => {
    enableCamera();

    captureButton = document.getElementById('capture');
    captureButton.addEventListener('click', captureImage);

    inquiryButton = document.getElementById('inquiry');
    inquiryButton.addEventListener('click', sendImageToAPI);
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
    canvas = document.querySelector('#image-capture');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context = canvas.getContext('2d');
    //hate css, some arbirary numbers to account for height difference
    context.drawImage(video, 0, 15, canvas.width, canvas.height * 0.938);
    let dataUrl = canvas.toDataURL('image/jpg');
    base64Image = dataUrl.split(',')[1];
    //console.log('Base64 image:', base64Image);

    let gptVisionText = document.getElementById('gpt-vision-text');
    gptVisionText.textContent = 'GPT Vision';
}


async function sendImageToAPI() {
    
    captureButton.disabled = true;
    inquiryButton.disabled = true;

    const visionAPI = new VisionAPI();
    try {
        const result = await visionAPI.saveImage(base64Image);
    } catch (error) {
        console.error('Failed to process image:', error);
    } finally {
        captureButton.disabled = false;
        inquiryButton.disabled = false;
        setTimeout(() => {
                context.clearRect(0, 0, canvas.width, canvas.height);
        }, 2000);

    }
}
