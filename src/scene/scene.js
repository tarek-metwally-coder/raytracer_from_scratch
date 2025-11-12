
import { buildBVH } from '../acceleration/bvh.js';

export class Scene {
    constructor() {
        this.objects = []; // List of All scene objects
        this.lights = [];  // List of lights in the scene
        this.normalObjects = []; // spheres,..
        this.infiniteObjects = []; // planes,..
        this.bvhRoot = null;
    }

    addObject(object) {
        this.objects.push(object);
        if (!object.bbox) {
            this.infiniteObjects.push(object);
        }
        else {
            this.normalObjects.push(object);
        }
    }

    removeObject(object) {
        this.objects = this.objects.filter(o => o !== object);
        if (!object.bbox) {
            this.infiniteObjects = this.infiniteObjects.filter(o => o !== object);
        } else {
            this.normalObjects = this.normalObjects.filter(o => o !== object);
        }
    }

    addlight(light) {
        this.lights.push(light);
    }

    removelight(light) {
        this.lights = this.lights.filter(l => l !== light);
    }
    buildBVH(maxObjectsPerNode = 4) {
        this.bvhRoot = buildBVH(this.normalObjects, maxObjectsPerNode);
    }

    getConfig() {
        return {
            scene: this.objects,
            normalObjects: this.normalObjects,
            infiniteObjects: this.infiniteObjects,
            bvhRoot: this.bvhRoot,
            lights: this.lights
        };
    }
}