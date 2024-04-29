// Audio functionality
var speech = true; 
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition(); 
recognition.interimResults = true;

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
let routing_pairs = [
    [".*feature (one).*"],
    [".*future (one).*"],
    [".*feature (1).*"],
    [".*future (1).*"],
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
            route = get_route(transcription_of_audio);
            document.querySelector(".test").textContent = transcription_of_audio;

            if( route ) {
                let loc = (route == '1' || route == "one") ? 1 : 2;
                window.location.href = `./feature-${loc}`;
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


start_audio_functionality();
setTimeout(() => {
    speakText("Select the feature to apply.");
}, 500);
