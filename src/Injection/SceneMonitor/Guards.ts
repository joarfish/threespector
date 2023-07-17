import { type Mesh, type Object3D } from 'three';

/**
 * Type guard for meshes.
 * @param obj
 */
export function isMesh(obj: Object3D): obj is Mesh {
    return 'material' in obj && 'geometry' in obj;
}
