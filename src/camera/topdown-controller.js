export class CameraController { // topdown

    constructor(camera, canvas) {
        this.camera = camera;
        this.canvas = canvas;
        this.keysPressed = new Set();

        this._onMouseMove = this._onMouseMove.bind(this);
        this._onKeyDown = this._onKeyDown.bind(this);
        this._onKeyUp = this._onKeyUp.bind(this);
      
        

    }

    // updates done to scene
    update() {
        

    }

    // enable controller ( add eveent listeners and so on)
    enable() {

    }
    // disable controller ( remove eveent listeners and so on and clean up)
    disable() {

    }

}
