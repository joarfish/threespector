import type * as THREE from 'three';
import { EditableShaderMaterial } from './EditableShaderMaterial';
import { EventEmitter } from '../EventEmitter';
import { type ShaderMaterial } from '../../Common/Materials';

/**
 * Type guard for ShaderMaterials and RawShaderMaterials.
 * @param material
 */
function isShaderMaterial(material: unknown): material is THREE.ShaderMaterial {
    return (
        material !== null &&
        typeof material === 'object' &&
        'type' in material &&
        (material.type === 'ShaderMaterial' ||
            material.type === 'RawShaderMaterial')
    );
}

type ShaderCollectionEvent =
    | {
          type: 'MaterialRemoved';
          uuid: string;
      }
    | {
          type: 'MaterialAdded';
          material: ShaderMaterial;
      };

/**
 * Keeps track of ShaderMaterials in the scene and forwards edit request to the
 * corresponding EditableShaderMaterial.
 */
export class ShaderMaterialsCollection extends EventEmitter<ShaderCollectionEvent> {
    private readonly shaderMaterials = new Map<
        string,
        EditableShaderMaterial
    >();

    public addMaterial(material: THREE.Material | THREE.Material[]): void {
        if (material === null || material === undefined) {
            return;
        }

        if (Array.isArray(material)) {
            material.forEach(material => {
                this.addMaterial(material);
            });
        } else if (
            isShaderMaterial(material) &&
            !this.shaderMaterials.has(material.uuid)
        ) {
            this.shaderMaterials.set(
                material.uuid,
                new EditableShaderMaterial(material),
            );
            this.dispatchEvent({
                type: 'MaterialAdded',
                material: {
                    uuid: material.uuid,
                    vertexShader: material.vertexShader,
                    fragmentShader: material.fragmentShader,
                },
            });
        }
    }

    public refreshMaterials(): void {
        const uuidsToRemove = [];
        for (const [uuid, material] of this.shaderMaterials.entries()) {
            if (material.canBeRemoved()) {
                uuidsToRemove.push(uuid);
            }
        }
        uuidsToRemove.forEach(uuid => {
            this.shaderMaterials.delete(uuid);
            this.dispatchEvent({
                type: 'MaterialRemoved',
                uuid,
            });
        });
    }

    public getShaderMaterialUuids(): string[] {
        return [...this.shaderMaterials.keys()];
    }

    public getEditableShaderMaterial(uuid: string): EditableShaderMaterial {
        const editor = this.shaderMaterials.get(uuid);
        if (editor === undefined) {
            throw new Error('Unknown Material!');
        }
        return editor;
    }

    public clear(): void {
        this.shaderMaterials.clear();
    }
}
