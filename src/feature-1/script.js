// URL of the Teachable Machine model
const URL = "https://teachablemachine.withgoogle.com/models/c6Gv0UQsF/";
let model, maxPredictions;

// Create video and canvas elements for displaying camera feed and capturing images.
const videoElement = document.createElement('video');
const canvasElement = document.createElement('canvas');

// Getting DOM elements
const captureButton = document.getElementById('captureButton');
const resultPara = document.querySelector(".result p");

// Access the user's camera and set up the video stream
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


/**
 * Load the Teachable Machine image model and metadata.
*/
async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";
    
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
}

/**
 * Predict the object in the given image and update the result.
 * @param {HTMLImageElement} image - The image to predict on.
*/
async function predict_and_update(image) {
    let detections = await model.predict(image);
    let max_probability = getMaxBySecondIndex(detections);

    let detected_object = (max_probability.probability > 0.80) ? max_probability.className : "";
    
    if(detected_object === to_detect) {
        speakText(`Found ${to_detect}`);
        product = null;
        to_detect = null;
        transcription_of_audio = null;
    }
    
    resultPara.style.visibility = "visible";
    resultPara.textContent = `${detected_object}`;
}

/**
 * Helper function to get the class with the maximum probability.
 * @param {Array} arrays - An array of prediction objects.
 * @returns {Object} The prediction object with the maximum probability.
*/
function getMaxBySecondIndex(arrays) {
    let maxValue = arrays[0].probability;
    let maxObject = arrays[0];

    for (let i = 1; i < arrays.length; i++) {
        const currentArray = arrays[i];
        const currentValue = currentArray.probability;

        if (currentValue > maxValue) {
            maxValue = currentValue;
            maxObject = currentArray;
        }
    }

    return maxObject;
}

/**
 * Capture the image when the button is clicked.
*/
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
        predict_and_update(capturedImage);
    }, 100);
});

/**
 * Main function to initialize the application.
*/
async function main() {
    await init();
    document.querySelector(".video-container").appendChild( videoElement );
    document.querySelector(".loading-screen").style.display = "none";
    speakText("Vision is now ready!");
    
    start_audio_functionality();
    
    setInterval(() => {
        captureButton.click();
    }, 800);
}

main();
setTimeout(() => {
    speakText("Vision is getting ready! Please wait!");
}, 100);


// Audio functionality
var speech = true; 
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition(); 
recognition.interimResults = true;

let to_detect = null;
let product = null;
let transcription_of_audio = null;

/**
 * Handle speech recognition results.
 * @param {SpeechRecognitionEvent} e - The speech recognition event.
*/
recognition.addEventListener('result', e => { 
    const transcript = Array.from(e.results) 
        .map(result => result[0]) 
        .map(result => result.transcript) 
        .join('') ;

    transcription_of_audio = transcript;
});

// Regular expressions to match different ways of asking to find an object
let pairs = [
    [".*find (.*)"],
    [".*can you find (.*)"],
    [".*can you locate (.*)"],
    [".*search for (.*)"],
    [".*look for (.*)"],
    [".*can you identify (.*)"],
];

let routing_pairs = [
    // [".*feature (one).*"],
    // [".*future (one).*"],
    // [".*feature (1).*"],
    // [".*future (1).*"],
    [".*feature (two).*"],
    [".*future (two).*"],
    [".*feature (to).*"],
    [".*future (to).*"],
    [".*feature (2).*"],
    [".*future (2).*"],
];

/**
 * Function to extract the object to find from the speech input.
 * @param {string} query - The speech input.
 * @returns {string|boolean} The object to find or false if not found.
*/
function get_product(query) {
    if (query === null) return;
    let res;
    for (let pair of pairs) {
        res = query.match(RegExp(pair));
        
        if(res) {
            return res[1];
        };
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
 * Start the speech recognition functionality.
*/
function start_audio_functionality() {
    if (speech == true) { 
        recognition.start(); 

        recognition.onend = () => {
            let query = transcription_of_audio;
            
            product = get_product(query);
            document.querySelector(".test").textContent = transcription_of_audio;

            if( product ) {
                if(product === "home key" || product === "room key" || product === "room ki" || product === "home ki"){
                    to_detect = "room-key";
                    speakText(`Searching for room key, keep roaming around`);
                }
                else if(product === "bike key" || product === "bike ki"){
                    to_detect = "bike-key";
                    speakText(`Searching for bike key, keep roaming around`);
                }
            }

            let route = get_route(query);
            if( route ) {
                if((route == '2' || route == "two" || route == "to")) {
                    window.location.href = `../feature-2`;
                }
            }
            
            setTimeout(() => {
                recognition.start();
            }, 1200);
        }; 
    }
}

/**
 * Function to speak the given text using the browser's speech synthesis.
 * @param {string} text - The text to speak.
*/
function speakText(text) {
    if ('speechSynthesis' in window) {
      let utterance = new SpeechSynthesisUtterance(text);
      speechSynthesis.speak(utterance);
    } else {
      alert("Sorry, speech synthesis is not supported by your browser.");
    }
}
