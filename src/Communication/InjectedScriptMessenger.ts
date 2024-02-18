import { type MessengerInterface } from './MessengerInterface';
import { MessageListener } from './MessageListener';

function isMessageFromRelay(data: unknown): boolean {
    return (
        data !== null &&
        typeof data === 'object' &&
        'direction' in data &&
        data.direction === 'content-to-injected' &&
        'message' in data
    );
}

/**
 * Messenger for communication between injected-script and devtools-panel.
 * Should be used by the injected script.
 */
export class InjectedScriptMessenger<Messages extends { type: string }>
    implements MessengerInterface<Messages>
{
    protected messageListener = new MessageListener<Messages>();

    constructor() {
        window.addEventListener('message', event => {
            if (isMessageFromRelay(event.data)) {
                this.messageListener.receiveMessage(event.data.message);
            }
        });
    }

    on<MessageType extends Messages['type']>(
        messageType: MessageType,
        handler: (message: Extract<Messages, { type: MessageType }>) => void,
    ): void {
        this.messageListener.registerHandler(messageType, handler);
    }

    post(message: Messages): void {
        window.postMessage({
            direction: 'injected-to-content',
            message: {
                ...message,
                timestamp: new Date().toLocaleTimeString('de', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    fractionalSecondDigits: 3,
                }),
            },
        });
    }
}
