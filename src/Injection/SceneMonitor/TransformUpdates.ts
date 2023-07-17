import { type Euler, type Object3D, type Vector3 } from 'three';
import { type TransformUpdate } from '../../Messages/SceneMessage';
import { quaternionToQuaternion, vector3ToVector3d } from './Conversion';

const cache = new WeakMap<
    Object3D,
    {
        position: Vector3;
        rotation: Euler;
        scale: Vector3;
    }
>();

/**
 * Check whether the transform of an object has changed. This relies on
 * cached data on in the object's userData.
 * @param object
 */
function hasTransformChanged(object: Object3D): boolean {
    const cachedTransform = cache.get(object);

    if (cachedTransform === undefined) {
        return true;
    }

    return (
        !object.position.equals(cachedTransform.position) ||
        !object.rotation.equals(cachedTransform.rotation) ||
        !object.scale.equals(cachedTransform.scale)
    );
}

/**
 * Returns a TransformUpdate object if the transform of the given object has
 * changed, otherwise null is returned.
 * @param object
 */
export function getTransformUpdate(object: Object3D): TransformUpdate | null {
    if (!hasTransformChanged(object)) {
        return null;
    }

    cache.set(object, {
        position: object.position.clone(),
        rotation: object.rotation.clone(),
        scale: object.scale.clone(),
    });

    const worldPosition = object.getWorldPosition(object.position.clone());
    const worldDirection = object.getWorldDirection(object.position.clone());
    const worldScale = object.getWorldScale(object.position.clone());

    return {
        uuid: object.uuid,
        position: vector3ToVector3d(object.position),
        worldPosition: vector3ToVector3d(worldPosition),
        rotation: vector3ToVector3d(object.rotation),
        worldDirection: vector3ToVector3d(worldDirection),
        scale: vector3ToVector3d(object.scale),
        worldScale: vector3ToVector3d(worldScale),
        quaternion: quaternionToQuaternion(object.quaternion),
    };
}
