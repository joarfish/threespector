import { type ShaderMaterialEditorMessage } from './ShaderMaterialEditorMessage';
import { type SceneMessage } from './SceneMessage';
import { type ApplicationMessage } from './ApplicationMessage';

// All messages that are supposed to be sent between DevTools-Panel and
// injected script.
export type Message =
    | ApplicationMessage
    | SceneMessage
    | ShaderMaterialEditorMessage;
