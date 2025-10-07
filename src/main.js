import { AppState, getCurrentState, switchState, onStateChange } from "./core/state-manager.js";
import { Sphere } from "./scene/objects/sphere.js";
import { Plane } from "./scene/objects/plane.js";
import { Camera } from "./camera/camera.js";
import { CameraController } from "./camera/camera-controller.js";
import { getRenderer } from "./renderer/index.js";
import { Scene } from "./scene/scene.js";


// Initialize the app state
console.log('App starting in state:', getCurrentState());

onStateChange((newState, oldState) => {
    console.log(`State changed from ${oldState} to ${newState}`);

    if (oldState === AppState.FIRST_PERSON) {
        exitFirstPersonMode(); // Exit first-person mode if switching from it
        canvas.style.display = 'none'; // Hide the canvas   
    }

    if (newState === AppState.FIRST_PERSON) {
        canvas.style.display = 'block'; // Show the canvas
        enterFirstPersonMode(); // Enter first-person mode
        document.getElementById('debug-overlay').textContent = `State: ${newState}`;
    }

    if (oldState === AppState.INTRO) {
        console.log('Exiting INTRO state');
    }

    if (newState === AppState.INTRO) {
        console.log('Entering INTRO state');
        document.getElementById('debug-overlay').textContent = `State: ${newState}`;
        // Here you can add logic to display the intro screen
    }

    if (oldState === AppState.TOP_DOWN) {
        console.log('Exiting TOP_DOWN state');
    }

    if (newState === AppState.TOP_DOWN) {
        console.log('Entering TOP_DOWN state');
        // Here you can add logic to switch to top-down view
        document.getElementById('debug-overlay').textContent = `State: ${newState}`;
    }

});

// temp controlls to handle state changes
window.addEventListener('keydown', (e) => {
    if (e.key === '1') switchState(AppState.INTRO);
    if (e.key === '2') switchState(AppState.TOP_DOWN);
    if (e.key === '3') switchState(AppState.FIRST_PERSON);
});


// Create the main canvas, and camera and descripe the scene then call the renderer
const canvas = document.createElement('canvas');
canvas.width = 800; // Set canvas width
canvas.height = 600; // Set canvas height
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

// lowResCanvas
const lowResCanvas = document.createElement('canvas');
lowResCanvas.width = 180; // Set low resolution canvas width
lowResCanvas.height = 180; // Set low resolution canvas height
const lowResCtx = lowResCanvas.getContext('2d');

ctx.imageSmoothingEnabled = false;
lowResCtx.imageSmoothingEnabled = false;
canvas.style.imageRendering = 'pixelated';

// scene
const scene = new Scene();

scene.addObject(new Sphere({ center: [0, -1, 3], radius: 1, color: [255, 0, 0], specular: 500, reflective: 0.2 })); // Red sphere shiny
scene.addObject(new Sphere({ center: [-2, 0, 4], radius: 1, color: [0, 0, 255], specular: 500, reflective: 0.3 })); // Green sphere shiny
scene.addObject(new Sphere({ center: [2, 0, 4], radius: 1, color: [0, 255, 0], specular: 10, reflective: 0.4 })); // Blue sphere somewhat shiny
scene.addObject(new Sphere({ center: [0, 0, -3], radius: 1, color: [255, 0, 255], specular: 10, reflective: 0.5 })); // Yellow sphere very shiny
// scene.addObject(new Sphere({ center: [0, -5001, 0], radius: 5000, color: [255, 255, 0], specular: 1000, reflective: 0.5 })); // Yellow sphere very shiny
scene.addObject(new Plane({ point: [0, -1, 0], normal: [0, 1, 0], color: [255, 255, 0], specular: 1000, reflective: 0.5 })); // acts as floor just to test will remove later
scene.addObject(new Plane({ point: [0, 0, 10], normal: [0, 0, -1], color: [200, 200, 225], specular: 300, reflective: 0.1 })); // Blue plane faces camera

scene.addlight({ type: 'ambient', intensity: 0.2 });
scene.addlight({ type: 'point', intensity: 0.6, position: [2, 1, 0] });
scene.addlight({ type: 'directional', intensity: 0.2, direction: [1, 4, 4] });
const sceneObjects = scene.getConfig().scene;

const lights = scene.getConfig().lights;

const config = {
    width: lowResCanvas.width,
    height: lowResCanvas.height,
    recursionDepth: 3,
    lights: lights,
    scene: sceneObjects,
};

const renderer = getRenderer("raytracer");

const camera = new Camera();

const cameraController = new CameraController(camera, canvas);
let running = false; // Flag to control the rendering loop
let loopId = null;

function loop() {
    if (!running) return;

    //handle input
    cameraController.update();


    lowResCtx.clearRect(0, 0, lowResCanvas.width, lowResCanvas.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    renderer(camera, lowResCtx, config);
    //   we draw on the action canvas what the lower canvas has cause i render on low res then shove to high res and make it pixelated 
    //  for now untill i figure out a better way of doing this i guess i can hand it to renderer and make it take two canvases lowres + highres. 
    ctx.drawImage(lowResCanvas, 0, 0, canvas.width, canvas.height);
    requestAnimationFrame(loop); // Request the next frame

}



function enterFirstPersonMode() {
    cameraController.enable(); // Enable camera controller for first-person mode
    running = true; // Start the rendering loop
    loopId = requestAnimationFrame(loop); // Start the rendering loop
}

function exitFirstPersonMode() {
    cameraController.disable(); // Disable camera controller
    running = false; // Stop the rendering loop
    if (loopId) {
        cancelAnimationFrame(loopId); // Cancel the rendering loop
        loopId = null;
    }
}