// Imports
import { ObjectDetector, FilesetResolver } from 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.2';

// Global variables
let objectDetector;
let runningMode = 'IMAGE';

// Initialization function
/**
 * Initializes the ObjectDetector instance with the specified options.
 * @returns {Promise<void>}
 */
const initializeObjectDetector = async () => {
    const vision = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.2/wasm');
    objectDetector = await ObjectDetector.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite',
            delegate: 'GPU'
        },
        scoreThreshold: 0.5,
        runningMode: runningMode
    });
    await objectDetector.setOptions({ runningMode: 'IMAGE' });
};

// Main function
/**
 * The main function that initializes the object detector, sets up the UI, and starts the audio functionality.
 * @returns {Promise<void>}
 */
async function main() {
    await initializeObjectDetector();
    console.log('Started...');
    document.querySelector('.video-container').appendChild(videoElement);
    document.querySelector('.loading-screen').style.display = 'none';
    speakText("Vision is now ready!");
    
    start_audio_functionality();
}

// setTimeout(() => {
//     speakText("Vision is getting ready! Please wait!");
// }, 300);
main();

// Video functionality
const videoElement = document.createElement('video');
const canvasElement = document.createElement('canvas');

const captureButton = document.getElementById('captureButton');
const resultPara = document.querySelector('.result p');

// Get access to the camera and set up the video stream
navigator.mediaDevices.getUserMedia({
    video: {
        facingMode: 'environment' // Use the back camera
    }
})
    .then(stream => {
        videoElement.srcObject = stream;
        videoElement.play();
    })
    .catch(error => alert('Error accessing camera:', error));

// Capture button event listener
captureButton.addEventListener('click', async () => {
    const videoWidth = videoElement.videoWidth;
    const videoHeight = videoElement.videoHeight;
    canvasElement.width = videoWidth;
    canvasElement.height = videoHeight;

    const context = canvasElement.getContext('2d');
    context.drawImage(videoElement, 0, 0, videoWidth, videoHeight);

    const capturedImage = new Image();
    capturedImage.src = canvasElement.toDataURL('image/png');

    setTimeout(() => {
        detect_image(capturedImage);
    }, 100);
});

// Audio functionality
var speech = true;
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognition.interimResults = true;

let to_detect = null;
let product = null;
let transcription_of_audio = null;

// Speech recognition event listener
recognition.addEventListener('result', e => {
    const transcript = Array.from(e.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');

    transcription_of_audio = transcript;
});

/**
 * Starts the audio functionality and speech recognition.
 */
function start_audio_functionality() {
    if (speech) {
        recognition.start();

        recognition.onend = () => {
            setTimeout(() => {
                recognition.start();
            }, 1500);

            if (transcription_of_audio === '' || !transcription_of_audio) return;

            document.querySelector('.test').textContent = transcription_of_audio;

            let route = get_route( transcription_of_audio );
            if( route ) {
                if((route == '1' || route == "one")) {
                    window.location.href = `../feature-1`;
                }
            }
            
            to_detect = get_object(transcription_of_audio.toLowerCase());

            if (to_detect) {
                captureButton.click();
            }

            transcription_of_audio = null;
        };
    }
}

// Regular expressions for matching object names
let pairs = [
    ['.*(person).*'],
    ['.*(bottle).*'],
    ['.*(cell phone).*'],
    ['.*(laptop).*'],
    ['.*(mouse).*'],
];

let routing_pairs = [
    [".*feature (one).*"],
    [".*future (one).*"],
    [".*feature (1).*"],
    [".*future (1).*"],
    // [".*feature (two).*"],
    // [".*future (two).*"],
    // [".*feature (to).*"],
    // [".*future (to).*"],
    // [".*feature (2).*"],
    // [".*future (2).*"],
];

/**
 * Get the object name from the transcribed audio based on regular expression matching.
 * @param {string} query - The transcribed audio text.
 * @returns {string|boolean} The matched object name or false if no match is found.
 */
function get_object(query) {
    if (query === null) return;
    let res;
    for (let pair of pairs) {
        res = query.match(RegExp(pair));

        if (res) {
            return res[1];
        }
    }
    return false;
}

function get_route(query) {
    if (query === null) return;
    let res;
    for (let pair of routing_pairs) {
        res = query.match(RegExp(pair));
        
        if(res) {
            return res[1];
        };
    }
    return false;
}

/**
 * Detects objects in the given image element and speaks out the position of the detected object.
 * @param {HTMLImageElement} img_element - The image element containing the captured image.
 * @returns {Promise<void>}
 */
async function detect_image(img_element) {
    let detections = await objectDetector.detect(img_element);
    detections = detections.detections;

    let text = [];

    let result = detections.map(detection => [detection.categories[0].categoryName, detection.boundingBox]);
    for (let detection of result) {
        if (detection[0] === to_detect) {
            text.push('a ' + to_detect + ' in ' + getPosition(detection[1]['originX'], detection[1]['originY'], detection[1]['width'], detection[1]['height']));
        }
    }

    console.log(result);
    resultPara.style.visibility = 'visible';
    resultPara.textContent = JSON.stringify(text);
    for (let message of text) {
        speakText(message);
    }
    document.querySelector('.test').textContent = '';
}

/**
 * Speaks the given text using the Web Speech API.
 * @param {string} text - The text to be spoken.
 */
function speakText(text) {
    if ('speechSynthesis' in window) {
        let utterance = new SpeechSynthesisUtterance(text);
        speechSynthesis.speak(utterance);
    } else {
        alert('Sorry, speech synthesis is not supported by your browser.');
    }
}

/**
 * Calculates the position (top, bottom, left, right, center) of the detected object based on its bounding box coordinates.
 * @param {number} X - The x-coordinate of the bounding box.
 * @param {number} Y - The y-coordinate of the bounding box.
 * @param {number} width - The width of the bounding box.
 * @param {number} height - The height of the bounding box.
 * @returns {string} The position of the detected object.
 */
function getPosition(X, Y, width, height) {
    const graphWidth = 640;
    const graphHeight = 480;

    // Center coordinates
    const centerX = X + (width / 2);
    const centerY = Y + (height / 2);

    // Determine position
    let position = '';

    if (centerY <= graphHeight * 0.25) {
        position += 'top ';
    } else if (centerY >= graphHeight * 0.75) {
        position += 'lower ';
    } else {
        position += 'middle ';
    }

    if (centerX <= graphWidth * 0.25) {
        position += 'left';
    } else if (centerX >= graphWidth * 0.75) {
        position += 'right';
    } else {
        position += 'center';
    }

    return position;
}