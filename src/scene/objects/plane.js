import { SceneObject } from "./base-object.js";
import { MathUtils } from "../../utils/math-utils.js";

export class Plane extends SceneObject{
    constructor({ point = [0,0,0], normal = [0,1,0], color = [255,255,255], specular = 50, reflective = 0.3 } = {}) {
        super();
        this.point = point; // Point on the plane
        this.normal = normal; // Normal vector of the plane
        this.color = color; // Plane color
        this.specular = specular; // Specular reflection coefficient
        this.reflective = reflective; // Reflective coefficient
    }

    intersect(rayOrigin, rayDirection){
        const denominator = MathUtils.dot(this.normal, rayDirection);
        if (Math.abs(denominator) < 1e-6) return [Infinity, Infinity]; // Ray is parallel to the plane

        const O_minus_P0 = MathUtils.subtract(rayOrigin, this.point); // O - P0
        const t = - MathUtils.dot(O_minus_P0, this.normal) / denominator; // Calculate t

        if (t < 0) return [Infinity, Infinity]; // Intersection is behind the ray origin

        return [t, t]; // Return the intersection point (t, t) since it's a plane


    }

    getNormal(_) {
        return this.normal; // The normal is constant for a plane
    }
}