import { MathUtils } from "../utils/math-utils.js";

export class CameraController { // first person
    constructor(camera, canvas) {
        this.camera = camera;
        this.canvas = canvas;

        this.mouseSensitivity = 0.002;
        this._lockPending = false;
        this._isPointerLocked = false;

        this.keysPressed = new Set();

        this._onMouseMove = this._onMouseMove.bind(this);
        this._onKeyDown = this._onKeyDown.bind(this);
        this._onKeyUp = this._onKeyUp.bind(this);
        this._onPointerLockChange = this._onPointerLockChange.bind(this);
        this._requestPointerLock = this._requestPointerLock.bind(this);

    }

    _addEventListeners() {
        this.canvas.addEventListener('mousemove', this._onMouseMove);
        this.canvas.addEventListener('click', () => { this._requestPointerLock(); });

        document.addEventListener('keydown', this._onKeyDown);
        document.addEventListener('keyup', this._onKeyUp);
        document.addEventListener('pointerlockchange', this._onPointerLockChange);

    }

    _removeEventListeners() {
        this.canvas.removeEventListener('mousemove', this._onMouseMove);
        document.removeEventListener('keydown', this._onKeyDown);
        document.removeEventListener('keyup', this._onKeyUp);
        document.removeEventListener('pointerlockchange', this._onPointerLockChange);
        this.canvas.removeEventListener('click', this._requestPointerLock);

    }

    _requestPointerLock() {
        console.log("Canvas clicked: requesting pointer lock");
        if (!this._isPointerLocked) {
            this._lockPending = true;
            this.canvas.requestPointerLock();
        }
    }

    _onPointerLockChange() {
        this._isPointerLocked = document.pointerLockElement === this.canvas;
        this._lockPending = false;
    }

    _onKeyDown(e) {
        // if (e.key === 'Escape') {
        //     this._removeEventListeners();
        //     return;
        this.keysPressed.add(e.key.toLowerCase());
    }

    _onKeyUp(e) {
        this.keysPressed.delete(e.key.toLowerCase());
    }

    _onMouseMove(e) {
        if (!this._isPointerLocked || this._lockPending) return;

        const { movementX, movementY } = e;
        const newYaw = this.camera.yaw + movementX * this.mouseSensitivity;;
        const newPitch = this.camera.pitch + movementY * this.mouseSensitivity;

        const maxPitch = Math.PI / 2 - 0.01; // Prevent flipping
        const newPitchClamped = Math.max(-maxPitch, Math.min(maxPitch, newPitch));
        this.camera.yaw = newYaw;
        this.camera.pitch = newPitchClamped;
    }

    update() {
        const forward = this.camera.getForwardVector();
        const right = this.camera.getRightVector();
        const speed = this.camera.movementSpeed;
        let dx = 0, dy = 0, dz = 0;

        if (this.keysPressed.has('w')) {
            dx += forward[0]; dz += forward[2];
        }
        if (this.keysPressed.has('s')) {
            dx -= forward[0]; dz -= forward[2];
        }
        if (this.keysPressed.has('a')) {
            dx -= right[0]; dz -= right[2];
        }
        if (this.keysPressed.has('d')) {
            dx += right[0]; dz += right[2];
        }

        if (this.keysPressed.has(' ')) { // Space for up (Y+)
            dy += 1;
        }
        if (this.keysPressed.has('shift')) { // Shift for down (Y-)
            dy -= 1;
        }

        const movementVec = MathUtils.normalize3([dx, dy, dz]);
        this.camera.moveBy(movementVec[0] * speed, movementVec[1] * speed, movementVec[2] * speed);
        // Prevent camera from going below ground level (y = 0)
        if (this.camera.position[1] < 0.5) {
            this.camera.position[1] = 0.5;
        }
    }


    enable() {
        this._addEventListeners();

    }

    disable() {
        this.keysPressed.clear();
        this._removeEventListeners();
        this._isPointerLocked = false;

        if (document.pointerLockElement === this.canvas) {

            document.exitPointerLock();
        }
    }
}