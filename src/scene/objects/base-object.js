export class SceneObject {
    intersect(rayOrigin, rayDirection) {
        throw new Error("Method 'intersect' must be implemented in derived classes.");
    }
    getNormal(point) {
        throw new Error("Method 'getNormal' must be implemented in derived classes.");
    }
}