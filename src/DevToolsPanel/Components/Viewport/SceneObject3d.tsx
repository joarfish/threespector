import { type JSX } from 'react';
import { useStore } from 'zustand';
import { sceneStore } from '../../Store';
import { shallow } from 'zustand/shallow';
import { Mesh } from './Mesh';
import { LightLocation } from './LightLocation';
import { getTransform } from './Utils/Transform';

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

    switch (sceneObject.spectorType) {
        case 'WithGeometry':
            return (
                <Mesh uuid={sceneObject.uuid}>
                    {sceneObject.children.map(childUuid => (
                        <SceneObject3d key={childUuid} uuid={childUuid} />
                    ))}
                </Mesh>
            );
        case 'Group': {
            return (
                <group {...getTransform(sceneObject)}>
                    {sceneObject.children.map(childUuid => (
                        <SceneObject3d key={childUuid} uuid={childUuid} />
                    ))}
                </group>
            );
        }
        case 'Scene': {
            return (
                <scene {...getTransform(sceneObject)}>
                    {sceneObject.children.map(childUuid => (
                        <SceneObject3d key={childUuid} uuid={childUuid} />
                    ))}
                </scene>
            );
        }
        case 'Light': {
            return (
                <LightLocation uuid={uuid}>
                    {sceneObject.children.map(childUuid => (
                        <SceneObject3d key={childUuid} uuid={childUuid} />
                    ))}
                </LightLocation>
            );
        }
        default:
            return (
                <object3D {...getTransform(sceneObject)}>
                    {sceneObject.children.map(childUuid => (
                        <SceneObject3d key={childUuid} uuid={childUuid} />
                    ))}
                </object3D>
            );
    }
}
