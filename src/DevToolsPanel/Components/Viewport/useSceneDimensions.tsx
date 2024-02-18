import { useMemo } from 'react';
import * as THREE from 'three';
import { useStore } from 'zustand';
import { sceneStore } from '../../Store';

// To avoid re-allocations:
const _box = new THREE.Box3();
const _size = new THREE.Vector3();
const _center = new THREE.Vector3();

export function useSceneDimensions(): {
    width: number;
    height: number;
    center: [number, number, number];
    sceneBox: THREE.Box3;
} {
    const objectsByUuid = useStore(
        sceneStore,
        state => state.scene.objectByUuid,
    );
    return useMemo(() => {
        const sceneBox = new THREE.Box3();

        for (const object of Object.values(objectsByUuid)) {
            if (object.worldBox !== undefined) {
                sceneBox.union(
                    _box.set(
                        new THREE.Vector3(
                            object.worldBox.min.x,
                            object.worldBox.min.y,
                            object.worldBox.min.z,
                        ),
                        new THREE.Vector3(
                            object.worldBox.max.x,
                            object.worldBox.max.y,
                            object.worldBox.max.z,
                        ),
                    ),
                );
            } else {
                sceneBox.expandByPoint(
                    new THREE.Vector3(
                        object.worldPosition.x,
                        object.worldPosition.y,
                        object.worldPosition.z,
                    ),
                );
            }
        }

        const center = sceneBox.getCenter(_center);
        const size = sceneBox.getSize(_size);

        const width = Math.max(...size.toArray());

        return {
            width: Math.max(width, 1),
            height: Math.max(width, 1),
            center: [center.x, center.y, center.z],
            sceneBox,
        };
    }, [objectsByUuid]);
}
