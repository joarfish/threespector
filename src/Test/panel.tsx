import ReactDOM from 'react-dom/client';
import React from 'react';
import { DevToolsPanel } from '../DevToolsPanel/Components/DevToolsPanel';
import { sceneStore, shaderMaterialsStore } from '../DevToolsPanel/Store';
import sceneJson from './Fixtures/giga_scene.json';
import {
    ShaderMaterialEditorController,
    ShaderMaterialEditorControllerProvider,
} from '../DevToolsPanel/Controller/ShaderMaterialEditorController';
import { type MessengerInterface } from '../Communication/MessengerInterface';
import { type Message } from '../Messages';
import { type ShaderMaterialEditorMessage } from '../Messages/ShaderMaterialEditorMessage';
import { type Scene } from '../Common/Scene';
import {
    SceneController,
    SceneControllerProvider,
} from '../DevToolsPanel/Controller/SceneController';

sceneStore.getState().setScene(sceneJson as Scene);
// ShaderMaterial for testing
shaderMaterialsStore.getState().addMaterial({
    uuid: '897347293847',
    fragmentShader: `
        void main() {
          gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
        }
    `,
    vertexShader: `
      varying vec3 vPosition;
      void main() {
          gl_Position = vec4( vPosition, 1.0 );
      }
    `,
});

/**
 * TestMessenger that does nothing.
 */
class TestMessenger implements MessengerInterface<Message> {
    on<MessageType>(
        _messageType: MessageType,
        _handler: (message: Extract<Message, { type: MessageType }>) => void,
    ): void {}

    post(_message: Message): void {}
}

const messenger = new TestMessenger();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <SceneControllerProvider value={new SceneController()}>
            <ShaderMaterialEditorControllerProvider
                value={
                    new ShaderMaterialEditorController(
                        messenger as MessengerInterface<ShaderMaterialEditorMessage>,
                    )
                }>
                <DevToolsPanel />
            </ShaderMaterialEditorControllerProvider>
        </SceneControllerProvider>
    </React.StrictMode>,
);
