import { type MessengerInterface } from '../../Communication/MessengerInterface';
import { type ShaderMaterialEditorMessage } from '../../Messages/ShaderMaterialEditorMessage';
import { type ShaderMaterialsCollection } from './ShaderMaterialsCollection';

/**
 * Sets up event handlers related to shader material editing.
 * @param collection
 * @param messenger
 */
export function initShaderMaterialEditor(
    collection: ShaderMaterialsCollection,
    messenger: MessengerInterface<ShaderMaterialEditorMessage>,
): void {
    messenger.on('RequestReportMaterials', () => {
        const materials = collection.getShaderMaterialUuids().map(uuid => {
            const material = collection.getEditableShaderMaterial(uuid);
            const { fragmentShader, vertexShader } = material.getShaders();
            return {
                uuid,
                vertexShader,
                fragmentShader,
            };
        });

        messenger.post({
            type: 'ReportMaterials',
            materials,
        });
    });

    messenger.on('RequestShaderUpdate', request => {
        try {
            const editor = collection.getEditableShaderMaterial(request.uuid);
            editor.updateShader(request.shaderType, request.code);

            messenger.post({
                type: 'ReportShaderUpdateSuccess',
                uuid: request.uuid,
            });
        } catch (error) {
            messenger.post({
                type: 'MaterialUnknown',
                uuid: request.uuid,
            });
        }
    });

    collection.addEventListener('MaterialRemoved', ({ uuid }) => {
        messenger.post({
            type: 'MaterialUnknown',
            uuid: uuid,
        });
    });

    collection.addEventListener('MaterialAdded', ({ material }) => {
        messenger.post({
            type: 'ReportMaterials',
            materials: [material],
        });
    });
}
