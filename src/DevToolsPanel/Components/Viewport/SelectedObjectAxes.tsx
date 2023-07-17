import { getWorldTransform } from './Utils/Transform';
import { useStore } from 'zustand';
import { sceneStore } from '../../Store';
import { shallow } from 'zustand/shallow';

/**
 * If an object is selected its local coordinate space axis will be displayed
 * via this component.
 * @constructor
 */
export function SelectedObjectAxes(): JSX.Element {
    const { selectedObject, objectsByUuid } = useStore(
        sceneStore,
        state => ({
            selectedObject: state.selectedObject,
            objectsByUuid: state.scene.objectByUuid,
        }),
        shallow,
    );

    const object =
        selectedObject === null ? null : objectsByUuid[selectedObject];

    if (object === null) {
        return <></>;
    }

    return <axesHelper args={[2]} {...getWorldTransform(object)} />;
}
