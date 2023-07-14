import { type MessengerInterface } from '../Communication/MessengerInterface';
import { type SceneMessage, type SceneUpdate } from '../Messages/SceneMessage';
import { type AABB, type Scene, type SceneObject } from '../Common/Scene';
import { type Scene as THREEScene, type Object3D, type Mesh } from 'three';
import { type ShaderMaterialsCollection } from './ShaderMaterialEditor/ShaderMaterialsCollection';

/**
 * Type guard for meshes.
 * @param obj
 */
function isMesh(obj: Object3D): obj is Mesh {
    return 'material' in obj && 'geometry' in obj;
}

/**
 * Normalize any object into a SceneObject that can be send to the devtools-panel.
 * @param object3d
 */
function object3DtoSceneObject(object3d: Object3D): SceneObject {
    const worldPosition = object3d.getWorldPosition(object3d.position.clone()); // Cloning a vector avoids importing THREE here.
    const worldDirection = object3d.getWorldDirection(
        object3d.position.clone(),
    ); // Cloning a vector avoids importing THREE here.
    let box: AABB | undefined;
    let materialUuids: string[] | undefined;

    if (isMesh(object3d)) {
        const geometry = object3d.geometry;

        if (Array.isArray(object3d.material)) {
            materialUuids = object3d.material.map(({ uuid }) => uuid);
        } else {
            materialUuids = [object3d.material.uuid];
        }

        if (geometry.boundingBox === null) {
            // Todo: Allow to be configured whether we are allowed to do this:
            geometry.computeBoundingBox();
        }

        if (geometry.boundingBox !== null) {
            const min = object3d.localToWorld(geometry.boundingBox.min.clone());
            const max = object3d.localToWorld(geometry.boundingBox.max.clone());
            box = {
                min: {
                    x: min.x,
                    y: min.y,
                    z: min.z,
                },
                max: {
                    x: max.x,
                    y: max.y,
                    z: max.z,
                },
            };
        }
    }

    return {
        type: object3d.type,
        uuid: object3d.uuid,
        name: object3d.name,
        parent: object3d.parent?.uuid,
        worldPosition: {
            x: worldPosition.x,
            y: worldPosition.y,
            z: worldPosition.z,
        },
        worldDirection: {
            x: worldDirection.x,
            y: worldDirection.y,
            z: worldDirection.z,
        },
        position: {
            x: object3d.position.x,
            y: object3d.position.y,
            z: object3d.position.z,
        },
        rotation: {
            x: object3d.rotation.x,
            y: object3d.rotation.y,
            z: object3d.rotation.z,
        },
        scale: {
            x: object3d.scale.x,
            y: object3d.scale.y,
            z: object3d.scale.z,
        },
        children: object3d.children.map(({ uuid }) => uuid),
        box,
        materialUuids,
        isLight: 'isLight' in object3d ? (object3d.isLight as boolean) : false,
    };
}

// Todo: Decouple messaging from collecting!

/**
 * The SceneMonitor keeps track of a scene by injecting callbacks into ThreeJs'
 * prototypes. It reports them via the provided messenger to the devtools panel.
 */
export class SceneMonitor {
    protected scene: WeakRef<THREEScene>;
    protected messenger: MessengerInterface<SceneMessage>;
    protected shaderMaterialCollection: ShaderMaterialsCollection;

    constructor(
        scene: THREEScene,
        messenger: MessengerInterface<SceneMessage>,
        shaderMaterialCollection: ShaderMaterialsCollection,
    ) {
        this.scene = new WeakRef(scene);
        this.messenger = messenger;
        this.shaderMaterialCollection = shaderMaterialCollection;

        messenger.on('RequestReportFullScene', () => {
            this.handleRequestReportFullScene();
        });
        this.injectCallbacks(scene);
    }

    /**
     * Inject callbacks for `add`, `remove`, and `removeFromParent` into
     * Object3ds and their inheritors.
     * @param object
     * @protected
     */
    protected injectCallbacks(object: Object3D): void {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const that = this;
        const prototype = Object.getPrototypeOf(object);

        // Make sure we don't inject the callbacks twice:
        if (prototype.___threespector_injected___ as boolean) {
            return;
        }
        prototype.___threespector_injected___ = true;

        prototype._add = prototype.add;
        prototype.add = function add(...objects: Object3D[]) {
            that.handleNewObjects(this.uuid, objects);
            this._add(...objects);
        };
        prototype._remove = prototype.remove;
        prototype.remove = function remove(...object: Object3D[]) {
            that.messenger.post({
                type: 'ReportSceneUpdate',
                updates: object.map(o => ({
                    type: 'ObjectRemoved',
                    uuid: o.uuid,
                })),
            });
            this._remove(...object);
            setTimeout(() => {
                that.shaderMaterialCollection.refreshMaterials();
            }, 0);
        };
        prototype._removeFromParent = prototype.removeFromParent;
        prototype.removeFromParent = function removeFromParent() {
            that.messenger.post({
                type: 'ReportSceneUpdate',
                updates: [
                    {
                        type: 'ObjectRemoved',
                        uuid: this.uuid,
                    },
                ],
            });
            this._removeFromParent();
            setTimeout(() => {
                that.shaderMaterialCollection.refreshMaterials();
            }, 0);
        };
    }

    /**
     * Creates a full scene report and sends it to the devtools panel.
     * @protected
     */
    protected handleRequestReportFullScene(): void {
        const scene = this.scene.deref();
        if (scene === undefined) {
            this.messenger.post({
                type: 'ReportSceneLost',
            });
            return;
        }
        this.shaderMaterialCollection.clear(); // Clear material collection to they can collected again and messaged to the devtool-panel
        const sceneReport: Scene = {
            objects: [],
            objectByUuid: {},
            rootUuid: scene.uuid,
        };
        const objectsToTravers: Object3D[] = [];

        objectsToTravers.push(scene);

        while (objectsToTravers.length > 0) {
            const object = objectsToTravers.pop();
            if (object === undefined) {
                continue;
            }
            objectsToTravers.push(...object.children);

            if (isMesh(object)) {
                this.shaderMaterialCollection.addMaterial(object.material);
            }
            sceneReport.objects.push(object.uuid);
            sceneReport.objectByUuid[object.uuid] =
                object3DtoSceneObject(object);
            this.injectCallbacks(object);
        }

        this.messenger.post({
            type: 'ReportFullScene',
            sceneReport,
        });
    }

    /**
     * Handles new objects that have been added to the scene (or to an object in
     * the scene)
     * @param parentUuid
     * @param objects
     * @protected
     */
    protected handleNewObjects(parentUuid: string, objects: Object3D[]): void {
        const updates: SceneUpdate[] = [];
        const children: Object3D[] = [];

        for (const object of objects) {
            if (isMesh(object)) {
                this.shaderMaterialCollection.addMaterial(object.material);
            }
            this.injectCallbacks(object);
            Array.prototype.push.apply(object.children, children);
            updates.push({
                type: 'ObjectAdded',
                parentUuid,
                object: object3DtoSceneObject(object),
            });
        }

        this.messenger.post({
            type: 'ReportSceneUpdate',
            updates,
        });
    }
}
