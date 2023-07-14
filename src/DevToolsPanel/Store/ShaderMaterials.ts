import { createStore } from 'zustand';
import { type ShaderMaterial, type ShaderType } from '../../Common/Materials';

export enum SyncState {
    Dirty,
    UpdatePending,
    Synced,
}

type ShaderMaterialsStore = {
    materialsByUuid: Record<string, ShaderMaterial>;
    materials: string[];
    materialStateByUuid: Record<string, SyncState>;
    addMaterial: (material: ShaderMaterial) => void;
    removeMaterial: (uuid: string) => void;
    updateShader: (uuid: string, shaderType: ShaderType, code: string) => void;
    startSync: (uuid: string) => void;
    finishSync: (uuid: string, success: boolean) => void;
    reset: () => void;
};

const initialState = {
    materialsByUuid: {},
    materials: [],
    materialStateByUuid: {},
};

export const shaderMaterialsStore = createStore<ShaderMaterialsStore>()(
    set => ({
        ...initialState,
        addMaterial: (material: ShaderMaterial) => {
            set(state => ({
                materialsByUuid: {
                    ...state.materialsByUuid,
                    [material.uuid]: material,
                },
                materials: [...state.materials, material.uuid],
                materialStateByUuid: {
                    ...state.materialStateByUuid,
                    [material.uuid]: SyncState.Synced,
                },
            }));
        },
        removeMaterial: (uuid: string) => {
            set(state => ({
                materialsByUuid: Object.fromEntries(
                    Object.entries(state.materialsByUuid).filter(
                        ([materialUuid]) => materialUuid !== uuid,
                    ),
                ),
                materials: state.materials.filter(
                    materialUuid => materialUuid !== uuid,
                ),
                materialStateByUuid: Object.fromEntries(
                    Object.entries(state.materialStateByUuid).filter(
                        ([materialUuid]) => materialUuid !== uuid,
                    ),
                ),
            }));
        },
        updateShader: (uuid: string, shaderType: ShaderType, code: string) => {
            set(state => ({
                materialsByUuid: {
                    ...state.materialsByUuid,
                    [uuid]: {
                        ...state.materialsByUuid[uuid],
                        [shaderType]: code,
                    },
                },
                materialStateByUuid: {
                    ...state.materialStateByUuid,
                    [uuid]: SyncState.Dirty,
                },
            }));
        },
        startSync: uuid => {
            set(state => ({
                materialStateByUuid: {
                    ...state.materialStateByUuid,
                    [uuid]: SyncState.UpdatePending,
                },
            }));
        },
        finishSync: (uuid, success) => {
            set(state => ({
                materialStateByUuid: {
                    ...state.materialStateByUuid,
                    [uuid]: success ? SyncState.Synced : SyncState.Dirty,
                },
            }));
        },
        reset: () => {
            set({
                ...initialState,
            });
        },
    }),
);
