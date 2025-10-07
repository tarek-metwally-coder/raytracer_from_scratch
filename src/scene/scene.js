


export class Scene {
    constructor() {
        this.objects = []; // List of scene objects
        this.lights = [];  // List of lights in the scene
    }

    addObject(object) {
        this.objects.push(object);
    }

    removeObject(object) {
        this.objects = this.objects.filter(o => o !== object);
    }

    addlight(light) {
        this.lights.push(light);
    }

    removelight(light) {
        this.lights = this.lights.filter(l => l !== light);
    }

    getConfig() {
        return {
            scene: this.objects,
            lights: this.lights
        };
    }
}