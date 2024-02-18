import { type Camera } from 'three';
import { type AABB, type Vector3d } from '../../Common/Scene';
import { createControllerContext } from './CreateControllerContext';
import { sceneStore } from '../Store';
import { type OrbitControls as OrbitControlsImpl } from 'three-stdlib/controls/OrbitControls';

function findAncestorsWorldBox(uuid: string): AABB | null {
    const scene = sceneStore.getState().scene;
    const object = scene.objectByUuid[uuid];

    if (object.parent === undefined) {
        return null;
    }

    const parent = scene.objectByUuid[object.parent];

    if (parent.worldBox !== undefined) {
        return parent.worldBox;
    }

    return findAncestorsWorldBox(parent.uuid);
}

export class SceneController {
    protected camera: Camera | null = null;
    protected controls: OrbitControlsImpl | null = null;

    public setCurrentCameraAndControls(
        camera: Camera,
        controls: OrbitControlsImpl,
    ): void {
        this.camera = camera;
        this.controls = controls;
    }

    public setCameraPositionAndTarget(
        position: Vector3d,
        target: Vector3d,
    ): void {
        if (this.controls === null || this.camera === null) {
            return; // Or throw error?
        }

        this.camera.position.set(position.x, position.y, position.z);
        this.controls.target.set(target.x, target.y, target.z);
        this.controls.update();
    }

    public setCameraToObject(uuid: string): void {
        const object = sceneStore.getState().scene.objectByUuid[uuid];

        let distance = 10;
        let center = object.worldPosition;

        const worldBox = object.worldBox ?? findAncestorsWorldBox(object.uuid);

        if (worldBox !== null) {
            const size = [
                worldBox.max.x - worldBox.min.x,
                worldBox.max.y - worldBox.min.y,
                worldBox.max.z - worldBox.min.z,
            ];
            center = {
                x: worldBox.min.x + 0.5 * size[0],
                y: worldBox.min.y + 0.5 * size[1],
                z: worldBox.min.z + 0.5 * size[2],
            };
            distance = Math.max(...size);
        }

        this.setCameraPositionAndTarget(
            {
                x: center.x + 2 * distance,
                y: center.y + 2 * distance,
                z: center.z + 2 * distance,
            },
            center,
        );
    }
}

export const {
    useController: useSceneController,
    Provider: SceneControllerProvider,
} = createControllerContext<SceneController>();
