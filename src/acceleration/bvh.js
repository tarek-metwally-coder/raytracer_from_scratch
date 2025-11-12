export class BVHNode {
    constructor(bbox, left = null, right = null, objects = null) {
        this.bbox = bbox;       // Bounding box of this node
        this.left = left;
        this.right = right;
        this.objects = objects; // Objects contained in this node (if leaf)
    }
    isLeaf() {
        return !!this.objects;
    }
}

export function mergeBoundingBoxes(bbox1, bbox2) {
    return {
        min: {
            x: Math.min(bbox1.min.x, bbox2.min.x),
            y: Math.min(bbox1.min.y, bbox2.min.y),
            z: Math.min(bbox1.min.z, bbox2.min.z)
        },
        max: {
            x: Math.max(bbox1.max.x, bbox2.max.x),
            y: Math.max(bbox1.max.y, bbox2.max.y),
            z: Math.max(bbox1.max.z, bbox2.max.z)

        }
    }
}

export function buildBVH(objects, maxObjectsPerNode = 4) {
    if (!objects || objects.length === 0) {
        return null;
    }

    if (objects.length <= maxObjectsPerNode) {
        const bbox = computeBoundingboxForSceneObjects(objects);
        return new BVHNode(bbox, null, null, objects);
    }

    const globalBBox = computeBoundingboxForSceneObjects(objects);
    const extent = {
        x: globalBBox.max.x - globalBBox.min.x,
        y: globalBBox.max.y - globalBBox.min.y,
        z: globalBBox.max.z - globalBBox.min.z
    };

    const axis = extent.x > extent.y && extent.x > extent.z ? 'x' :
        extent.y > extent.z ? 'y' : 'z';
    objects.sort((a, b) => {
        const ca = (a.bbox.min[axis] + a.bbox.max[axis]) / 2;
        const cb = (b.bbox.min[axis] + b.bbox.max[axis]) / 2;
        return ca - cb;
    });

    const mid = Math.floor(objects.length / 2);
    const left = buildBVH(objects.slice(0, mid), maxObjectsPerNode);
    const right = buildBVH(objects.slice(mid), maxObjectsPerNode);

    if (!left) return right;
    if (!right) return left;

    const mergedBBox = mergeBoundingBoxes(left.bbox, right.bbox);
    return new BVHNode(mergedBBox, left, right, null);

}

export function intersectRayBVH(O, D, t_min, t_max, bvhNode) {
    if (!bvhNode) return [null, Infinity];

    // early exit if ray doesn't intersect bounding box
    if (!intersectRayABB(O, D, bvhNode.bbox, t_min, t_max)) {
        return [null, Infinity];
    }
    // leaf check each object
    if (bvhNode.isLeaf()) {
        let closest_t = Infinity;
        let closest_obj = null;
        for (const obj of bvhNode.objects) {

            const [t1, t2] = obj.intersect(O, D);

            if (t1 > t_min && t1 < t_max && t1 < closest_t) {
                closest_t = t1;
                closest_obj = obj;
            }

            if (t2 > t_min && t2 < t_max && t2 < closest_t) {
                closest_t = t2;
                closest_obj = obj;
            }
        }

        return [closest_obj, closest_t];
    }
    // internal node
    const [left_obj, left_t] = intersectRayBVH(O, D, t_min, t_max, bvhNode.left);
    const [right_obj, right_t] = intersectRayBVH(O, D, t_min, t_max, bvhNode.right);

    return (left_t < right_t) ? [left_obj, left_t] : [right_obj, right_t];
}

export function visualizeBVH() {

}

export function computeBoundingboxForSceneObjects(objects) {
    let bbox = null;
    for (const  obj of objects) {
        if (!obj.bbox) continue; // skip objects without bounding box ex planes
        bbox = bbox ? mergeBoundingBoxes(bbox, obj.bbox) : obj.bbox;
    }
    return bbox;
}

function intersectRayABB(O, D, bbox, t_min, t_max) {
    const axes = ['x', 'y', 'z'];
    for (let i = 0; i < 3; i++) {
        const axis = axes[i];
        const invD = 1 / D[i];
        let t0 = (bbox.min[axis] - O[i]) * invD;
        let t1 = (bbox.max[axis] - O[i]) * invD;

        if (t0 > t1) [t0, t1] = [t1, t0]; // swap

        t_min = Math.max(t_min, t0);
        t_max = Math.min(t_max, t1);

        if (t_max <= t_min) return false;
    }
    return true;
}