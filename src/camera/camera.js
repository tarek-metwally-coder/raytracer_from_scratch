import { MathUtils } from "../utils/math-utils.js";



export const CameraModes = Object.freeze({
    FIRST_PERSON: 'firstPerson',
    TOP_DOWN: 'topDown'
});

export class Camera {

    constructor({
        mode = CameraModes.FIRST_PERSON,
        position,
        viewportWidth = 1,
        viewportHeight = 1,
        viewportDistance = 1,
        yaw,
        pitch,
        movementSpeed
    } = {}) {
        this.mode = mode;

        if (mode === CameraModes.FIRST_PERSON) {
            this.position = position ?? [0, 1, 0];
            this.yaw = yaw ?? 0;
            this.pitch = pitch ?? 0;
            this.movementSpeed = movementSpeed ?? 0.1;
        } else if (mode === CameraModes.TOP_DOWN) {
            this.position = position ?? [0, 20, 0];
            this.yaw = yaw ?? 0;
            this.pitch = pitch ?? -Math.PI / 2;
            this.movementSpeed = movementSpeed ?? 0.5;
        }

        this.viewportWidth = viewportWidth;
        this.viewportHeight = viewportHeight;
        this.viewportDistance = viewportDistance;
    }


    moveBy(dx, dy, dz) {
        this.position[0] += dx;
        this.position[1] += dy;
        this.position[2] += dz;
        // Prevent camera from going below ground level (y = 0)
        if (this.position[1] < 0.5) {
            this.position[1] = 0.5;
        }

    }

    getRotationMatrix() {
        return MathUtils.multiply3x3Matrices(

            MathUtils.createYawMatrix(this.yaw),
            MathUtils.createPitchMatrix(this.pitch)
        );
    }

    getForwardVector() {
        const forward = [0, 0, 1];
        return MathUtils.rotateVector(forward, this.getRotationMatrix());
    }

    getRightVector() {
        const right = [1, 0, 0];
        return MathUtils.rotateVector(right, this.getRotationMatrix());
    }


}