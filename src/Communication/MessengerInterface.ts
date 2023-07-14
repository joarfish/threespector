export interface MessengerInterface<Messages extends { type: string }> {
    post: (message: Messages) => void;
    on: <MessageType extends Messages['type']>(
        messageType: MessageType,
        handler: (message: Extract<Messages, { type: MessageType }>) => void,
    ) => void;
}
