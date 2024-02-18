import { Canvas } from '@react-three/fiber';
import {
    OrbitControls,
    type OrbitControlsChangeEvent,
    PerspectiveCamera,
} from '@react-three/drei';
import { useStore } from 'zustand';
import { applicationStore, sceneStore } from '../../Store';
import { type JSX, useMemo, useRef } from 'react';
import { Ground } from './Ground';
import { Scene } from './Scene';
import * as THREE from 'three';
import { useSceneController } from '../../Controller/SceneController';
import { type OrbitControls as OrbitControlsImpl } from 'three-stdlib/controls/OrbitControls';
import { useSceneDimensions } from './useSceneDimensions';
import { orientationToVector3 } from '../../Lib/Orientation';

// To avoid re-allocations:
const _box = new THREE.Box3();
const _size = new THREE.Vector3();
const _sphere = new THREE.Sphere();

/**
 * 3D Viewport displaying the Scene.
 * @constructor
 */
export function Viewport(): JSX.Element {
    const sceneController = useSceneController();
    const scene = useStore(sceneStore, state => state.scene);
    const up = useStore(applicationStore, state =>
        orientationToVector3(state.orientation),
    );

    const { center, width, sceneBox } = useSceneDimensions();

    const initialCameraPosition = useMemo(() => {
        return [
            center[0] + width * 0.5,
            center[1] + width,
            center[2] + width * 0.5,
        ] as const;
    }, [scene.rootUuid]);

    const cameraRef = useRef<THREE.PerspectiveCamera>(null);
    const orbitControlsRef = useRef<OrbitControlsImpl>(null);

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
        _box.getBoundingSphere(_sphere);

        cameraRef.current.far = 2 * _sphere.radius;

        if (orbitControlsRef.current !== null) {
            sceneController.setCurrentCameraAndControls(
                cameraRef.current,
                orbitControlsRef.current,
            );
        }
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
                    position={initialCameraPosition}
                    makeDefault={true}
                    up={up}
                />
                <OrbitControls
                    ref={orbitControlsRef}
                    makeDefault={true}
                    target={[0, 0, 0]}
                    enableDamping={false}
                    onChange={handleControlsOnChange}
                />
                <Scene />
                <Ground
                    center={[center[0], center[1], 0]}
                    width={width * 1.2}
                    height={width * 1.2}
                />
                <ambientLight />
            </Canvas>
        </div>
    );
}
