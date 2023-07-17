export type Vector3d = {
    x: number;
    y: number;
    z: number;
};

export type Quaternion = {
    x: number;
    y: number;
    z: number;
    w: number;
};

export type AABB = {
    min: Vector3d;
    max: Vector3d;
};

export type SpectorObjectType =
    | 'WithGeometry'
    | 'Light'
    | 'Group'
    | 'Scene'
    | 'Other';

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
    quaternion: Quaternion;
    scale: Vector3d;
    worldScale: Vector3d;
    children: string[];
    materialUuids?: string[];
    spectorType: SpectorObjectType;
};

export type Scene = {
    objects: string[];
    objectByUuid: Record<string, SceneObject>;
    rootUuid: string | null;
};
