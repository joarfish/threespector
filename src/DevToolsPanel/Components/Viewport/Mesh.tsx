import { type JSX, type PropsWithChildren, useMemo, useState } from 'react';
import { useStore } from 'zustand';
import { sceneStore } from '../../Store';
import { Box3, Color, Vector3 } from 'three';
import { shallow } from 'zustand/shallow';
import './ColoredBox3Helper';
import { getTransform } from './Utils/Transform';

export function Mesh(props: PropsWithChildren<{ uuid: string }>): JSX.Element {
    const { uuid } = props;
    const { sceneObject, selectObject, selectedObject } = useStore(
        sceneStore,
        state => ({
            sceneObject: state.scene?.objectByUuid[uuid],
            selectedObject: state.selectedObject,
            selectObject: state.selectObject,
        }),
        shallow,
    );
    const [hover, setHover] = useState(false);
    const boundingBox = useMemo(() => {
        if (sceneObject.box === undefined) {
            return new Box3(new Vector3(-1, -1, -1), new Vector3(1, 1, 1));
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
        <object3D {...getTransform(sceneObject)}>
            <coloredBox3Helper
                args={[boundingBox]}
                color={
                    hover || sceneObject.uuid === selectedObject
                        ? hoverColor
                        : color
                }
                onClick={event => {
                    selectObject(sceneObject.uuid);
                    event.stopPropagation();
                }}
                onPointerEnter={event => {
                    setHover(true);
                    event.stopPropagation();
                }}
                onPointerLeave={event => {
                    setHover(false);
                    event.stopPropagation();
                }}></coloredBox3Helper>
            {props.children}
        </object3D>
    );
}
