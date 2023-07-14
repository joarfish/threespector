/**
 * Simple message listener that allows for registering handlers.
 */
export class MessageListener<Messages extends { type: string }> {
    private readonly handlers = new Map<
        Messages['type'],
        Array<(message: Messages) => void>
    >();

    public registerHandler<Message extends Messages>(
        messageType: Message['type'],
        handler: (message: Message) => void,
    ): void {
        let handlers = this.handlers.get(messageType);
        if (handlers === undefined) {
            handlers = [];
            this.handlers.set(messageType, handlers);
        }

        handlers.push(handler as (message: unknown) => void);
    }

    public receiveMessage(message: Messages): void {
        const handlers = this.handlers.get(message.type);
        if (handlers === undefined) {
            return;
        }
        handlers.forEach(handler => {
            handler(message);
        });
    }
}
