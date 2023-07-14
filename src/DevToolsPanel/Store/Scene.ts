import { createStore } from 'zustand';
import { type Scene, type SceneObject } from '../../Common/Scene';

type SceneStore = {
    scene: Scene | null;
    selectedObject: string | null;
    setScene: (scene: Scene | null) => void;
    addSceneObject: (parentUuid: string, object: SceneObject) => void;
    removeSceneObject: (objectUuid: string) => void;
    selectObject: (uuid: string) => void;
    unselect: () => void;
    reset: () => void;
};

export const sceneStore = createStore<SceneStore>()(set => ({
    scene: null,
    selectedObject: null,
    setScene: (scene: Scene | null) => {
        set({
            scene,
        });
    },
    addSceneObject: (parentUuid: string, object: SceneObject) => {
        set(state => {
            if (
                state.scene === null ||
                !Object.prototype.hasOwnProperty.call(
                    state.scene.objectByUuid,
                    parentUuid,
                )
            ) {
                return state;
            }

            const parent = state.scene.objectByUuid[parentUuid];

            return {
                ...state,
                scene: {
                    ...state.scene,
                    objects: [...state.scene.objects, object.uuid],
                    objectByUuid: {
                        ...state.scene.objectByUuid,
                        [object.uuid]: object,
                        [parentUuid]: {
                            ...parent,
                            children: [...parent.children, object.uuid],
                        },
                    },
                },
            };
        });
    },
    removeSceneObject: (objectUuid: string) => {
        set(state => {
            if (state.scene === null) {
                return state;
            }
            return {
                scene: {
                    ...state.scene,
                    objects: state.scene.objects.filter(
                        uuid => objectUuid !== uuid,
                    ),
                    objectByUuid: Object.fromEntries(
                        Object.entries(state.scene.objectByUuid).filter(
                            ([uuid]) => objectUuid !== uuid,
                        ),
                    ),
                },
            };
        });
    },
    selectObject: (uuid: string) => {
        set(({ scene }) => {
            if (
                !Object.prototype.hasOwnProperty.call(scene?.objectByUuid, uuid)
            ) {
                return {};
            }
            return {
                selectedObject: uuid,
            };
        });
    },
    unselect: () => {
        set({
            selectedObject: null,
        });
    },
    reset: () => {
        set({
            scene: null,
            selectedObject: null,
        });
    },
}));
