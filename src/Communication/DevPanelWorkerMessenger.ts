import { type MessengerInterface } from './MessengerInterface';
import { MessageListener } from './MessageListener';

/**
 * Messenger for communication between devtools-panel and service worker.
 */
export class DevPanelWorkerMessenger<Messages extends { type: string }>
    implements MessengerInterface<Messages>
{
    protected messageListener = new MessageListener<Messages>();
    protected port: chrome.runtime.Port | null = null;

    constructor() {
        const port = chrome.runtime.connect({ name: 'devtools-worker' });
        this.port = port;
        port.onMessage.addListener(message => {
            this.messageListener.receiveMessage(message);
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
