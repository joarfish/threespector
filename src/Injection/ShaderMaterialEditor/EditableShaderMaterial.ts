import { type RawShaderMaterial, type ShaderMaterial } from 'three';

/**
 * Represents a ShaderMaterial or a RawShaderMaterial and allows for
 * dynamically updating their shaders.
 */
export class EditableShaderMaterial {
    protected materialUuid: string;
    protected material: WeakRef<ShaderMaterial | RawShaderMaterial>;

    constructor(material: ShaderMaterial) {
        this.materialUuid = material.uuid;
        this.material = new WeakRef(material);
    }

    public getShaders(): { fragmentShader: string; vertexShader: string } {
        const material = this.derefOrThrow();
        return {
            fragmentShader: material.fragmentShader,
            vertexShader: material.vertexShader,
        };
    }

    public updateShader(
        type: 'fragmentShader' | 'vertexShader',
        code: string,
    ): void {
        const material = this.derefOrThrow();
        material[type] = code;
        material.needsUpdate = true;
    }

    public canBeRemoved(): boolean {
        const material = this.material.deref();
        return material === undefined;
    }

    protected derefOrThrow(): ShaderMaterial {
        const material = this.material.deref();
        if (material === undefined) {
            throw new Error('');
        }
        return material;
    }
}
