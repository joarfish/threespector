import { sceneStore, shaderMaterialsStore } from './Store';
import { type MessengerInterface } from '../Communication/MessengerInterface';
import { type Message } from '../Messages';

/**
 * Registers message handlers for communication between devtools-panel and
 * injected script. Most handlers have effects on the stores.
 * @param messenger
 */
export function setupHandlers(messenger: MessengerInterface<Message>): void {
    messenger.on('StartSession', () => {
        messenger.post({
            type: 'RequestReportFullScene',
        });
        messenger.post({
            type: 'RequestReportMaterials',
        });
    });

    messenger.on('ReportFullScene', message => {
        sceneStore.getState().setScene(message.sceneReport);
    });

    messenger.on('ReportSceneUpdate', message => {
        message.updates.forEach(update => {
            if (update.type === 'ObjectAdded') {
                sceneStore
                    .getState()
                    .addSceneObject(update.parentUuid, update.object);
            } else if (update.type === 'ObjectRemoved') {
                sceneStore.getState().removeSceneObject(update.uuid);
            }
        });
    });

    messenger.on('ReportSceneLost', () => {
        sceneStore.getState().setScene(null);
    });

    messenger.on('ReportMaterials', message => {
        message.materials.forEach(material => {
            shaderMaterialsStore.getState().addMaterial(material);
        });
    });

    messenger.on('ReportShaderUpdateSuccess', message => {
        shaderMaterialsStore.getState().finishSync(message.uuid, true);
    });

    messenger.on('MaterialUnknown', message => {
        shaderMaterialsStore.getState().removeMaterial(message.uuid);
    });
}
