import { MathUtils } from "../../utils/math-utils.js";
import { SceneObject } from "./base-object.js";

export class Sphere extends SceneObject {
    constructor({ center = [0,0,0], radius = 1, color = [255,255,255], specular = 50, reflective = 0.3 } = {}) {
        super();
        this.center = center; // Sphere center
        this.radius = radius; // Sphere radius
        this.color = color; // Sphere color
        this.specular = specular; // Specular reflection coefficient
        this.reflective = reflective; // Reflective coefficient
    }

    intersect(rayOrigin, rayDirection) {
        const CO = [rayOrigin[0] - this.center[0], rayOrigin[1] - this.center[1], rayOrigin[2] - this.center[2]];
        const a = MathUtils.dot(rayDirection, rayDirection);
        const b = 2 * MathUtils.dot(CO, rayDirection);
        const c = MathUtils.dot(CO, CO) - this.radius * this.radius;
        const discriminant = b * b - 4 * a * c;

        if (discriminant < 0) return [Infinity, Infinity]; // No intersection

        const t1 = (-b - Math.sqrt(discriminant)) / (2 * a);
        const t2 = (-b + Math.sqrt(discriminant)) / (2 * a);
        return [t1, t2]; // Return the two intersection points

    }

    getNormal(point) {
        const N = [
            point[0] - this.center[0],
            point[1] - this.center[1],
            point[2] - this.center[2]
        ]; // Normal vector at the point
        const length = MathUtils.length(N);
        return [
            N[0] / length,
            N[1] / length,
            N[2] / length
        ]; // Normalize the normal vector
    }
}