import { useStore } from 'zustand';
import { sceneStore } from '../../Store';
import { shallow } from 'zustand/shallow';
import { type PropsWithChildren, useState } from 'react';
import { vector3dAsTuple } from './Utils/Transform';

export function LightLocation(
    props: PropsWithChildren<{ uuid: string }>,
): JSX.Element {
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
    const position = sceneObject?.position;

    if (position === undefined) {
        return <></>;
    }

    return (
        <mesh
            position={vector3dAsTuple(sceneObject.position)}
            onClick={() => {
                selectObject(uuid);
            }}
            onPointerEnter={() => {
                setHover(true);
            }}
            onPointerLeave={() => {
                setHover(false);
            }}>
            <sphereGeometry args={[1, 4, 2]} />
            <meshBasicMaterial
                wireframe={true}
                fog={false}
                toneMapped={false}
                color={selectedObject === uuid || hover ? 0xff0000 : 0xaa00aa}
            />
            {props.children}
        </mesh>
    );
}
