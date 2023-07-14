import { shaderMaterialsStore } from '../Store';
import { type MessengerInterface } from '../../Communication/MessengerInterface';
import { type ShaderMaterialEditorMessage } from '../../Messages/ShaderMaterialEditorMessage';
import { createControllerContext } from './CreateControllerContext';

/**
 * Encapsulates logic for updating the shaders' of ShaderMaterials.
 */
export class ShaderMaterialEditorController {
    protected messenger: MessengerInterface<ShaderMaterialEditorMessage>;

    constructor(messenger: MessengerInterface<ShaderMaterialEditorMessage>) {
        this.messenger = messenger;
    }

    public applyUpdatedShader(uuid: string): void {
        const state = shaderMaterialsStore.getState();

        if (
            !Object.prototype.hasOwnProperty.call(
                state.materialStateByUuid,
                uuid,
            )
        ) {
            return;
        }

        const material = state.materialsByUuid[uuid];

        state.startSync(uuid);

        // Todo: Differentiate which is actually dirty:
        this.messenger.post({
            type: 'RequestShaderUpdate',
            uuid,
            shaderType: 'vertexShader',
            code: material.vertexShader,
        });
        this.messenger.post({
            type: 'RequestShaderUpdate',
            uuid,
            shaderType: 'fragmentShader',
            code: material.fragmentShader,
        });
    }
}

export const {
    useController: useShaderMaterialEditorController,
    Provider: ShaderMaterialEditorControllerProvider,
} = createControllerContext<ShaderMaterialEditorController>();
