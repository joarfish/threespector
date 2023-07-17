import {
    type Quaternion,
    type SceneObject,
    type Vector3d,
} from '../../../../Common/Scene';

type SceneObjectTransform = {
    position: [number, number, number];
    quaternion: [number, number, number, number];
    scale: [number, number, number];
};

export function vector3dAsTuple(vector: Vector3d): [number, number, number] {
    return [vector.x, vector.y, vector.z];
}

export function quaternionAsTuple(
    quaternion: Quaternion,
): [number, number, number, number] {
    return [quaternion.x, quaternion.y, quaternion.z, quaternion.w];
}

export function getTransform(object: SceneObject): SceneObjectTransform {
    return {
        position: vector3dAsTuple(object.position),
        quaternion: quaternionAsTuple(object.quaternion),
        scale: vector3dAsTuple(object.scale),
    };
}

export function getWorldTransform(object: SceneObject): SceneObjectTransform {
    return {
        position: vector3dAsTuple(object.worldPosition),
        quaternion: quaternionAsTuple(object.quaternion),
        scale: vector3dAsTuple(object.worldScale),
    };
}
