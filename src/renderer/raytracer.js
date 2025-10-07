import { MathUtils } from "../utils/math-utils.js";
import { ViewportUtils } from "../utils/viewport-utils.js";

export function renderRaytracedScene(camera, ctx, config) {
    const { width, height, recursionDepth, lights, scene } = config;

    const R = camera.getRotationMatrix();
    const O = camera.position;
    const viewportHeight = camera.viewportHeight
    const viewportWidth = camera.viewportWidth;
    const viewportDistance = camera.viewportDistance;

    for (let x = -(width / 2); x < (width / 2); x++) {
        for (let y = -(height / 2); y < (height / 2); y++) {
            const D = ViewportUtils.canvasToViewPort(x, y, height, width, viewportHeight, viewportWidth, viewportDistance); // Convert canvas coordinates to viewport coordinates
            const rotated_D = MathUtils.rotateVector(D, R); // Rotate the direction vector
            const color = TraceRay(O, rotated_D, 1, Infinity, recursionDepth, lights, scene);
            ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
            // Adjust coordinates to center the origin
            ctx.fillRect(x + width / 2, height / 2 - y, 1, 1);
        }
    }

}


function TraceRay(O, D, t_min, t_max, recursion_depth, lights, scene) {

    const [closest_obj, closest_t] = ClosestIntersection(O, D, t_min, t_max, scene);

    if (closest_obj === null) {
        return [0, 0, 0]; // Background color
    }

    const P = [O[0] + closest_t * D[0], O[1] + closest_t * D[1], O[2] + closest_t * D[2]]; // Intersection point
    const N = closest_obj.getNormal(P); // Normal at the intersection point
    const lighting = ComputeLighting(P, N, [D[0] * -1, D[1] * -1, D[2] * -1], closest_obj.specular, lights, scene); // Compute lighting
    const local_color = [
        closest_obj.color[0] * lighting,
        closest_obj.color[1] * lighting,
        closest_obj.color[2] * lighting
    ];


    const r = closest_obj.reflective;
    if (recursion_depth <= 0 || r <= 0) {
        // console.log(`Returning local color ${local_color}`);
        return local_color; // Return the local color if no reflection
    }

    const R = MathUtils.reflectRay([D[0] * -1, D[1] * -1, D[2] * -1], N); // Reflect the ray
    const reflected_color = TraceRay(P, R, 0.001, Infinity, recursion_depth - 1, lights, scene); // Trace the reflected ray
    return [
        local_color[0] * (1 - r) + reflected_color[0] * r,
        local_color[1] * (1 - r) + reflected_color[1] * r,
        local_color[2] * (1 - r) + reflected_color[2] * r
    ]; // Combine local and reflected colors
}


function ClosestIntersection(O, D, t_min, t_max, scene) {
    let closest_t = Infinity;
    let closest_obj = null;
    for (const obj of scene) {
        const [t1, t2] = obj.intersect(O, D); // Get intersection point
        if (t1 > t_min && t1 < t_max && t1 < closest_t) {
            closest_t = t1;
            closest_obj = obj;
        }
        if (t2 > t_min && t2 < t_max && t2 < closest_t) {
            closest_t = t2;
            closest_obj = obj;
        }
    }

    return [closest_obj, closest_t]


}

function ComputeLighting(P, N, V, s, lights, scene) {
    let i = 0.0
    for (const light of lights) {
        if (light.type === 'ambient') {
            i += light.intensity
        }
        else {
            let L = 0
            let t_max
            if (light.type === 'point') {
                L = [light.position[0] - P[0], light.position[1] - P[1], light.position[2] - P[2]]
                t_max = 1
            }
            else if (light.type === 'directional') {
                L = [light.direction[0], light.direction[1], light.direction[2]]
                t_max = Infinity
            }
            // shadow check
            const [shadow_sphere, shadow_t] = ClosestIntersection(P, L, 0.001, t_max, scene)
            if (shadow_sphere) {
                continue // Skip this light if there's a shadow
            }

            // diffuse
            const N_dot_L = MathUtils.dot(N, L)
            if (N_dot_L > 0) {
                i += light.intensity * N_dot_L / (MathUtils.length(N) * MathUtils.length(L))
            }

            // specular
            if (s != -1) {
                const R = MathUtils.reflectRay(L, N) // Reflect the light direction
                const V_dot_R = MathUtils.dot(V, R)
                if (V_dot_R > 0) {
                    i += light.intensity * Math.pow(V_dot_R / (MathUtils.length(V) * MathUtils.length(R)), s)
                }
            }
        }

    }
    return i
}
