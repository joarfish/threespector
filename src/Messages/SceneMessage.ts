import {
    type Quaternion,
    type Scene,
    type SceneObject,
    type Vector3d,
} from '../Common/Scene';

// Messages related to the main scene.

type RequestReportFullScene = {
    type: 'RequestReportFullScene';
};

type ReportFullScene = {
    type: 'ReportFullScene';
    sceneReport: Scene;
};

export type SceneUpdate =
    | { type: 'ObjectAdded'; parentUuid: string; object: SceneObject }
    | { type: 'ObjectRemoved'; parentUuid: string | undefined; uuid: string };

type ReportSceneUpdate = {
    type: 'ReportSceneUpdate';
    updates: SceneUpdate[];
};

type ReportSceneLost = {
    type: 'ReportSceneLost';
};

export type TransformUpdate = {
    uuid: string;
    position: Vector3d;
    worldPosition: Vector3d;
    rotation: Vector3d;
    worldDirection: Vector3d;
    scale: Vector3d;
    worldScale: Vector3d;
    quaternion: Quaternion;
};

type ObjectTransformUpdated = {
    type: 'ObjectTransformUpdated';
    updates: TransformUpdate[];
};

export type SceneMessage =
    | RequestReportFullScene
    | ReportFullScene
    | ReportSceneUpdate
    | ReportSceneLost
    | ObjectTransformUpdated;
