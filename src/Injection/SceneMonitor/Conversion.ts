import {
    type Euler,
    type Object3D,
    type Quaternion,
    type Vector3,
} from 'three';
import {
    type Quaternion as SpectorQuaternion,
    type AABB,
    type SceneObject,
    type SpectorObjectType,
    type Vector3d,
} from '../../Common/Scene';
import { isMesh } from './Guards';

/**
 * Convert a threejs Quaternion or Euler into a threespector Quaternion
 * @param quaternion
 */
export function quaternionToQuaternion(
    quaternion: Quaternion,
): SpectorQuaternion {
    return {
        x: quaternion.x,
        y: quaternion.y,
        z: quaternion.z,
        w: quaternion.w,
    };
}

/**
 * Convert a threejs Vector3 or Euler into a threespector Vector3d
 * @param vector
 */
export function vector3ToVector3d(vector: Vector3 | Euler): Vector3d {
    return {
        x: vector.x,
        y: vector.y,
        z: vector.z,
    };
}

/**
 * Normalize any object into a SceneObject that can be sent to the devtools-panel.
 * @param object3d
 */
export function object3DtoSceneObject(object3d: Object3D): SceneObject {
    const worldPosition = object3d.getWorldPosition(object3d.position.clone()); // Cloning a vector avoids importing THREE here.
    const worldDirection = object3d.getWorldDirection(
        object3d.position.clone(),
    );
    const worldScale = object3d.getWorldScale(object3d.position.clone());
    let box: AABB | undefined;
    let materialUuids: string[] | undefined;
    let spectorType: SpectorObjectType = 'Other';

    if (isMesh(object3d)) {
        const geometry = object3d.geometry;

        if (Array.isArray(object3d.material)) {
            materialUuids = object3d.material.map(({ uuid }) => uuid);
        } else {
            materialUuids = [object3d.material.uuid];
        }

        if (geometry.boundingBox === null) {
            // Todo: Allow to be configured whether we are allowed to do this:
            geometry.computeBoundingBox();
        }

        if (geometry.boundingBox !== null) {
            const min = geometry.boundingBox.min;
            const max = geometry.boundingBox.max;
            box = {
                min: vector3ToVector3d(min),
                max: vector3ToVector3d(max),
            };
        }

        spectorType = 'WithGeometry';
    } else if ('isLight' in object3d && (object3d.isLight as boolean)) {
        spectorType = 'Light';
    } else if ('isGroup' in object3d && (object3d.isGroup as boolean)) {
        spectorType = 'Group';
    } else if ('isScene' in object3d && (object3d.isScene as boolean)) {
        spectorType = 'Scene';
    }

    return {
        type: object3d.type,
        uuid: object3d.uuid,
        name: object3d.name,
        parent: object3d.parent?.uuid,
        worldPosition: vector3ToVector3d(worldPosition),
        worldDirection: vector3ToVector3d(worldDirection),
        worldScale: vector3ToVector3d(worldScale),
        position: vector3ToVector3d(object3d.position),
        quaternion: quaternionToQuaternion(object3d.quaternion),
        rotation: vector3ToVector3d(object3d.rotation),
        scale: vector3ToVector3d(object3d.scale),
        children: object3d.children.map(({ uuid }) => uuid),
        box,
        materialUuids,
        spectorType,
    };
}
