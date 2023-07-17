import { type MessengerInterface } from '../../Communication/MessengerInterface';
import {
    type SceneMessage,
    type SceneUpdate,
    type TransformUpdate,
} from '../../Messages/SceneMessage';
import { type Scene } from '../../Common/Scene';
import { type Scene as THREEScene, type Object3D } from 'three';
import { type ShaderMaterialsCollection } from '../ShaderMaterialEditor/ShaderMaterialsCollection';
import { getTransformUpdate } from './TransformUpdates';
import { isMesh } from './Guards';
import { object3DtoSceneObject } from './Conversion';

// Todo: Decouple messaging from collecting!

/**
 * The SceneMonitor keeps track of a scene by injecting callbacks into ThreeJs'
 * prototypes. It reports them via the provided messenger to the devtools panel.
 */
export class SceneMonitor {
    protected scene: WeakRef<THREEScene>;
    protected messenger: MessengerInterface<SceneMessage>;
    protected shaderMaterialCollection: ShaderMaterialsCollection;
    protected objects = new Map<string, WeakRef<Object3D>>();

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

        // This will be called on every frame and inform the devtools panel of
        // transform changes
        const refresh = (): void => {
            const updates: TransformUpdate[] = [];
            for (const objectRef of this.objects.values()) {
                const object = objectRef.deref();
                if (object === undefined) {
                    continue;
                }
                const update = getTransformUpdate(object);
                if (update !== null) {
                    updates.push(update);
                }
            }
            if (updates.length > 0) {
                this.messenger.post({
                    type: 'ObjectTransformUpdated',
                    updates,
                });
            }
            requestAnimationFrame(refresh);
        };

        requestAnimationFrame(refresh);
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
        prototype.remove = function remove(...objects: Object3D[]) {
            that.messenger.post({
                type: 'ReportSceneUpdate',
                updates: objects.map(object => ({
                    type: 'ObjectRemoved',
                    uuid: object.uuid,
                    parentUuid: object.parent?.uuid,
                })),
            });
            objects.forEach(({ uuid }) => {
                that.objects.delete(uuid);
            });
            this._remove(...objects);
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
                        parentUuid: this.parent.uuid,
                    },
                ],
            });
            that.objects.delete(object.uuid);
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
            this.objects.set(object.uuid, new WeakRef(object));
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
            this.objects.set(object.uuid, new WeakRef(object));
        }

        this.messenger.post({
            type: 'ReportSceneUpdate',
            updates,
        });
    }
}
