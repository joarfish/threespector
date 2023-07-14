import { type JSX } from 'react';
import { useStore } from 'zustand';
import { sceneStore } from '../../Store';
import { shallow } from 'zustand/shallow';
import { Mesh } from './Mesh';
import { LightLocation } from './LightLocation';

/**
 * Renders a scene object using the right component based on type
 * and other factors.
 * @param props
 * @constructor
 */
export function SceneObject3d(props: { uuid: string }): JSX.Element {
    const { uuid } = props;
    const { sceneObject } = useStore(
        sceneStore,
        state => ({
            sceneObject: state.scene?.objectByUuid[uuid],
            selectedObject: state.selectedObject,
            selectObject: state.selectObject,
        }),
        shallow,
    );

    if (sceneObject === undefined) {
        return <></>;
    }

    if (sceneObject.isLight) {
        return <LightLocation uuid={uuid} />;
    }

    switch (sceneObject.type) {
        case 'Mesh':
            return (
                <>
                    <Mesh sceneObject={sceneObject} />
                    <axesHelper
                        args={[2]}
                        position={[
                            sceneObject.worldPosition.x,
                            sceneObject.worldPosition.y,
                            sceneObject.worldPosition.z,
                        ]}
                        rotation={[
                            sceneObject.worldDirection.x,
                            sceneObject.worldDirection.y,
                            sceneObject.worldDirection.z,
                        ]}
                    />
                </>
            );
        default:
            return <></>;
    }
}
