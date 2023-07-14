import { type ShaderMaterialEditorMessage } from './ShaderMaterialEditorMessage';
import { type SceneMessage } from './SceneMessage';
import { type ApplicationMessage } from './ApplicationMessage';

// All messages that are supposed to be send between DevTools-Panel and
// injected script.
export type Message =
    | ApplicationMessage
    | SceneMessage
    | ShaderMaterialEditorMessage;

// Messages that are used between Worker and DevTools-Panel
export type WorkerMessage =
    | { type: 'InjectContentScript'; tabId: number }
    | {
          type: 'InjectedContentScript';
      }
    | {
          type: 'ErrorInjectingContentScript';
          error: string;
      };
