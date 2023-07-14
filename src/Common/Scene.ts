export type Vector3d = {
    x: number;
    y: number;
    z: number;
};

export type AABB = {
    min: Vector3d;
    max: Vector3d;
};

export type SceneObject = {
    uuid: string;
    type: string;
    name: string;
    parent?: string;
    worldPosition: Vector3d;
    worldDirection: Vector3d;
    box?: AABB;
    position: Vector3d;
    rotation: Vector3d;
    scale: Vector3d;
    children: string[];
    materialUuids?: string[];
    isLight: boolean;
};

export type Scene = {
    objects: string[];
    objectByUuid: Record<string, SceneObject>;
    rootUuid: string;
};
