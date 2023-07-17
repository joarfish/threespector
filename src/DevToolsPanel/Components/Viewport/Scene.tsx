import { type JSX } from 'react';
import { sceneStore } from '../../Store';
import { SceneObject3d } from './SceneObject3d';
import { useStore } from 'zustand';
import { SelectedObjectAxes } from './SelectedObjectAxes';

/**
 * Scene graph entry
 * @constructor
 */
export function Scene(): JSX.Element {
    const rootUuid = useStore(sceneStore, state => state.scene.rootUuid);

    if (rootUuid === null) {
        return <></>;
    }

    return (
        <>
            <SceneObject3d key={rootUuid} uuid={rootUuid} />
            <SelectedObjectAxes />
        </>
    );
}
