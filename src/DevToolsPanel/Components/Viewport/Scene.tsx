import { type JSX } from 'react';
import { sceneStore } from '../../Store';
import { SceneObject3d } from './SceneObject3d';
import { useStore } from 'zustand';

/**
 * Renders the actual scene and its objects.
 * @constructor
 */
export function Scene(): JSX.Element {
    const objects = useStore(sceneStore, state => state.scene?.objects);

    if (objects === undefined) {
        return <></>;
    }

    return (
        <>
            {objects.map(uuid => (
                <SceneObject3d key={uuid} uuid={uuid} />
            ))}
        </>
    );
}
