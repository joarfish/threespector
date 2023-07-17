import { createStore } from 'zustand';
import { type Scene, type SceneObject } from '../../Common/Scene';
import { type TransformUpdate } from '../../Messages/SceneMessage';

type SceneStore = {
    scene: Scene;
    selectedObject: string | null;
    setScene: (scene: Scene) => void;
    addSceneObject: (parentUuid: string, object: SceneObject) => void;
    removeSceneObject: (
        parentUuid: string | undefined,
        objectUuid: string,
    ) => void;
    selectObject: (uuid: string) => void;
    unselect: () => void;
    reset: () => void;
    updateTransforms: (transformUpdates: TransformUpdate[]) => void;
};

const emptyScene = {
    objectByUuid: {},
    objects: [],
    rootUuid: null,
};

export const sceneStore = createStore<SceneStore>()(set => ({
    scene: emptyScene,
    selectedObject: null,
    setScene: (scene: Scene) => {
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
    removeSceneObject: (parentUuid: string | undefined, objectUuid: string) => {
        set(state => {
            if (state.scene === null) {
                return state;
            }

            const objectByUuid = {
                ...Object.fromEntries(
                    Object.entries(state.scene.objectByUuid).filter(
                        ([uuid]) => objectUuid !== uuid,
                    ),
                ),
            };

            if (parentUuid !== undefined) {
                const parent = state.scene.objectByUuid[parentUuid];
                objectByUuid[parentUuid] = {
                    ...parent,
                    children: parent.children.filter(
                        childUuid => childUuid !== objectUuid,
                    ),
                };
            }

            return {
                scene: {
                    ...state.scene,
                    objects: state.scene.objects.filter(
                        uuid => objectUuid !== uuid,
                    ),
                    objectByUuid,
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
            scene: emptyScene,
            selectedObject: null,
        });
    },
    updateTransforms: (transformUpdates: TransformUpdate[]) => {
        set(({ scene }) => {
            if (scene === null) {
                return { scene };
            }
            const objectByUuid = { ...scene.objectByUuid };
            for (const update of transformUpdates) {
                objectByUuid[update.uuid] = {
                    ...objectByUuid[update.uuid],
                    worldPosition: { ...update.worldPosition },
                    position: { ...update.position },
                    worldDirection: { ...update.worldDirection },
                    rotation: { ...update.rotation },
                    worldScale: { ...update.worldScale },
                    scale: { ...update.scale },
                    quaternion: { ...update.quaternion },
                };
            }
            return {
                scene: {
                    ...scene,
                    objectByUuid,
                },
            };
        });
    },
}));
