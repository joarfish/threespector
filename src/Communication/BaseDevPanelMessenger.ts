import { type MessengerInterface } from './MessengerInterface';
import { MessageListener } from './MessageListener';

/**
 * Messenger for communication between injected script and devtools-panel.
 * Should be used by the devtools-panel.
 */
export class BaseDevPanelMessenger<Messages extends { type: string }>
    implements MessengerInterface<Messages>
{
    protected messageListener = new MessageListener<Messages>();
    protected port: chrome.runtime.Port | null = null;
    protected channelName: string;
    protected onConnectionEstablished?: (port: chrome.runtime.Port) => void;

    constructor(
        channelName: string,
        onConnectionEstablished?: (port: chrome.runtime.Port) => void,
    ) {
        this.channelName = channelName;
        this.onConnectionEstablished = onConnectionEstablished;
        this.establishConnection();
    }

    protected establishConnection(): void {
        const port = chrome.runtime.connect({ name: this.channelName });

        if (this.onConnectionEstablished !== undefined) {
            this.onConnectionEstablished(port);
        }

        port.onMessage.addListener(message => {
            this.messageListener.receiveMessage(message);
        });
        port.onDisconnect.addListener(() => {
            this.port = null;
            this.establishConnection();
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

        this.port.postMessage(this.transformMessage(message));
    }

    /**
     * Transforms all messages before they are posted. Override this in extending
     * classes to conform to what the service worker expects on this channel.
     * @param message
     * @protected
     */
    protected transformMessage(message: Messages): Record<string, unknown> {
        return message;
    }
}
