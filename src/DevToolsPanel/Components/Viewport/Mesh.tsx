import { type SceneObject } from '../../../Common/Scene';
import { type JSX, useMemo, useState } from 'react';
import { useStore } from 'zustand';
import { sceneStore } from '../../Store';
import { Box3, Color, Vector3 } from 'three';
import { shallow } from 'zustand/shallow';
import './ColoredBox3Helper';

export function Mesh(props: { sceneObject: SceneObject }): JSX.Element {
    const { sceneObject } = props;
    const { selectObject, selectedObject } = useStore(
        sceneStore,
        state => ({
            selectedObject: state.selectedObject,
            selectObject: state.selectObject,
        }),
        shallow,
    );
    const [hover, setHover] = useState(false);
    const boundingBox = useMemo(() => {
        if (sceneObject.box === undefined) {
            return new Box3(
                new Vector3(
                    sceneObject.worldPosition.x - 1,
                    sceneObject.worldPosition.y - 1,
                    sceneObject.worldPosition.z - 1,
                ),
                new Vector3(
                    sceneObject.worldPosition.x + 1,
                    sceneObject.worldPosition.y + 1,
                    sceneObject.worldPosition.z + 1,
                ),
            );
        }
        return new Box3(
            new Vector3(
                sceneObject.box.min.x,
                sceneObject.box.min.y,
                sceneObject.box.min.z,
            ),
            new Vector3(
                sceneObject.box.max.x,
                sceneObject.box.max.y,
                sceneObject.box.max.z,
            ),
        );
    }, []);
    const color = useMemo(() => new Color(1, 1, 1), []);
    const hoverColor = useMemo(() => new Color(1, 0, 0), []);

    if (sceneObject === undefined) {
        return <></>;
    }

    return (
        <coloredBox3Helper
            position={[
                sceneObject.worldPosition.x,
                sceneObject.worldPosition.y,
                sceneObject.worldPosition.z,
            ]}
            args={[boundingBox]}
            color={
                hover || sceneObject.uuid === selectedObject
                    ? hoverColor
                    : color
            }
            onClick={() => {
                selectObject(sceneObject.uuid);
            }}
            onPointerEnter={() => {
                setHover(true);
            }}
            onPointerLeave={() => {
                setHover(false);
            }}
        />
    );
}
