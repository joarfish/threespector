import { type MessengerInterface } from './MessengerInterface';
import { MessageListener } from './MessageListener';

/**
 * Messenger for communication between service worker and devtools-panel.
 * Should be used by the service worker.
 */
export class ServiceWorkerDevPanelMessenger<Messages extends { type: string }>
    implements MessengerInterface<Messages>
{
    protected messageListener = new MessageListener<Messages>();
    protected port: chrome.runtime.Port;

    constructor(port: chrome.runtime.Port) {
        if (port.name !== 'devtools-worker') {
            throw new Error(`Expecting port with name "devtools-worker!"`);
        }
        this.port = port;
        const addListenerHandler = (message: Messages): void => {
            this.messageListener.receiveMessage(message);
        };
        port.onMessage.addListener(addListenerHandler);
        port.onDisconnect.addListener(() => {
            port.onMessage.removeListener(addListenerHandler);
        });
    }

    on<MessageType extends Messages['type']>(
        messageType: MessageType,
        handler: (
            message: Extract<
                Messages,
                {
                    type: MessageType;
                }
            >,
        ) => void,
    ): void {
        this.messageListener.registerHandler(messageType, handler);
    }

    post(message: Messages): void {
        if (this.port === null) {
            throw new Error('Call to post before handler was initialized!');
        }
        this.port.postMessage(message);
    }
}
