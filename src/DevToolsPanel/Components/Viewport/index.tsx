import { Canvas } from '@react-three/fiber';
import {
    OrbitControls,
    type OrbitControlsChangeEvent,
    PerspectiveCamera,
} from '@react-three/drei';
import { useStore } from 'zustand';
import { sceneStore } from '../../Store';
import { type JSX, useMemo, useRef } from 'react';
import { Ground } from './Ground';
import { Scene } from './Scene';
import * as THREE from 'three';

// To avoid re-allocations:
const _box = new THREE.Box3();
const _size = new THREE.Vector3();

/**
 * 3D Viewport displaying the Scene.
 * @constructor
 */
export function Viewport(): JSX.Element {
    const scene = useStore(sceneStore, state => state.scene);
    // Calculate width, center and scene's AABB
    const { width, center, sceneBox } = useMemo(() => {
        if (scene === null) {
            return {
                width: 10,
                height: 10,
                center: [0, 0, 0] as const,
            };
        }

        let minX = Infinity;
        let minZ = Infinity;
        let maxX = -Infinity;
        let maxZ = -Infinity;

        for (const object of Object.values(scene.objectByUuid)) {
            minX = Math.min(minX, object.worldPosition.x);
            minZ = Math.min(minZ, object.worldPosition.z);
            maxX = Math.max(maxX, object.worldPosition.x);
            maxZ = Math.max(maxZ, object.worldPosition.z);
        }

        const width = Math.max(maxX - minX, maxZ - minZ);
        const center = [minX + width / 2, 0, minZ + width / 2] as const;

        return {
            width: Math.max(width, 1),
            height: Math.max(width, 1),
            center: [minX + width / 2, 0, minZ + width / 2] as const,
            sceneBox: new THREE.Box3().setFromCenterAndSize(
                new THREE.Vector3().fromArray(center),
                new THREE.Vector3(width, width, width),
            ),
        };
    }, [scene]);

    const cameraRef = useRef<THREE.PerspectiveCamera>(null);

    const handleControlsOnChange = (event?: OrbitControlsChangeEvent): void => {
        if (
            event === undefined ||
            event.type !== 'change' ||
            cameraRef.current === null ||
            sceneBox === undefined
        ) {
            return;
        }
        _box.copy(sceneBox).expandByPoint(cameraRef.current.position);
        _box.getSize(_size);

        cameraRef.current.far = Math.max(_size.x, _size.y, _size.z, 1000.0);
    };

    return (
        <div
            id={'canvas-container'}
            style={{
                width: '100%',
                height: '100%',
                background: '#2a2a2a',
                zIndex: 0,
            }}>
            <Canvas>
                <PerspectiveCamera
                    ref={cameraRef}
                    fov={60}
                    position={[
                        center[0] + width * 0.5,
                        center[1] + width,
                        center[2] + width * 0.5,
                    ]}
                    makeDefault={true}
                />
                <OrbitControls
                    makeDefault={true}
                    target={center}
                    enableDamping={false}
                    onChange={handleControlsOnChange}
                />
                <Scene />
                <Ground
                    center={center}
                    width={width * 1.5}
                    height={width * 1.5}
                />
                <ambientLight />
            </Canvas>
        </div>
    );
}
