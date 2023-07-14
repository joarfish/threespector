import { type Scene } from 'three';
import { InjectedScriptMessenger } from '../Communication/InjectedScriptMessenger';
import { SceneMonitor } from './SceneMonitor';
import { type Message } from '../Messages';
import { type SceneMessage } from '../Messages/SceneMessage';
import { initShaderMaterialEditor } from './ShaderMaterialEditor';
import { type ShaderMaterialEditorMessage } from '../Messages/ShaderMaterialEditorMessage';
import { ShaderMaterialsCollection } from './ShaderMaterialEditor/ShaderMaterialsCollection';

// This is the entry point to the injected script. It will respond to messages from
// the devtools panel (relayed via content-script and service-worker).

if (Object.hasOwn(window, '___threespector_scene___')) {
    // @ts-expect-error We know this to be of type Scene. Otherwise, we are doomed
    const scene = window.___threespector_scene___ as Scene;

    const messenger = new InjectedScriptMessenger<Message>();
    const materialCollection = new ShaderMaterialsCollection();
    const _sceneMonitor = new SceneMonitor(
        scene,
        messenger as InjectedScriptMessenger<SceneMessage>,
        materialCollection,
    );
    initShaderMaterialEditor(
        materialCollection,
        messenger as InjectedScriptMessenger<ShaderMaterialEditorMessage>,
    );
}
