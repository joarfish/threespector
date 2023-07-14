import { type Scene, type SceneObject } from '../Common/Scene';

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
    | { type: 'ObjectRemoved'; uuid: string };

type ReportSceneUpdate = {
    type: 'ReportSceneUpdate';
    updates: SceneUpdate[];
};

type ReportSceneLost = {
    type: 'ReportSceneLost';
};

export type SceneMessage =
    | RequestReportFullScene
    | ReportFullScene
    | ReportSceneUpdate
    | ReportSceneLost;
