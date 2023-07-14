import { type MessengerInterface } from './MessengerInterface';
import { MessageListener } from './MessageListener';

/**
 * Messenger for communication between injected script and devtools-panel.
 * Should be used by the devtools-panel.
 */
export class DevPanelMessenger<Messages extends { type: string }>
    implements MessengerInterface<Messages>
{
    protected messageListener = new MessageListener<Messages>();
    protected port: chrome.runtime.Port | null = null;

    constructor() {
        this.establishConnection();
    }

    protected establishConnection(): void {
        const port = chrome.runtime.connect({ name: 'devtools-passthrough' });
        // Send init message to so service-worker knows the tab id the messenger
        // is for.
        port.postMessage({
            type: 'init',
            tabId: chrome.devtools.inspectedWindow.tabId,
        });
        port.onMessage.addListener(message => {
            this.messageListener.receiveMessage(message);
        });
        port.onDisconnect.addListener(() => {
            this.port = null;
        });
        this.port = port;
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
            this.establishConnection();
        }

        if (this.port === null) {
            throw new Error(
                `Cannot post message because no connection to service worker!`,
            );
        }

        this.port.postMessage({
            type: 'send-message',
            tabId: chrome.devtools.inspectedWindow.tabId,
            message,
        });
    }
}
