# Vision Assist - web app for visually challenged people
Check out the [live demo](https://sharunashwanth.github.io/vision-assist/src/index.html) ⚡

## Abstract : 
VisionAssist project aims to addresses the following two major needs for visually impaired individuals:

1. **Frequent Object Search:** Users can input data about their frequently used objects into VisionAssist. The system utilizes this information to assist users in locating these objects within their homes. By leveraging object detection and localization technologies, VisionAssist provides real-time guidance to help users navigate to their desired items.

2. **Surroundings Understanding:** Through voice commands, users can request VisionAssist to identify specific objects in their surroundings. The system's object detection module scans the environment for relevant objects and provides real-time positional information about their locations. This feature enables users to gain a better understanding of their surroundings and interact with them more confidently.

## Development Tools Utilized:
- HTML/CSS/JavaScript: Frontend development for user interaction
- Git: Version control for collaborative development

## SDKs and APIs:
- Web Speech API: For speech recognition and synthesis
- TensorFlow.js: Machine learning library for AI model execution in the browser

## Libraries:

- Mediapipe: Framework for building cross-platform AI pipelines
- Teachable Machine: Tool for creating custom machine

## Assets : 
- Trained Classification model weights hosted on google cloud - [Get it here](https://teachablemachine.withgoogle.com/models/c6Gv0UQsF/)
- Weights for object detection using Tflite format weights stored on cloud - [Get it here](https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite)


## Run Locally

Clone the project

```bash
  git clone https://github.com/sharunashwanth/vision-assist.git
```

Go to the project directory

```bash
  cd vision-assist/src
```

Start the server

```py
  python -m http.server
```

You can visit the website in http://127.0.0.1:8000/

---
Read the [user manual](https://docs.google.com/document/d/19ZjSXKzkM2zxilgtFTOCV8nwzfbrik4Z9lWW0cycq40/edit?usp=sharing) for prior guidance