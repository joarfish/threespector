/**
 * Adds event-emitter capabilities to a class.
 */
export abstract class EventEmitter<Event extends { type: string }> {
    private readonly listeners = new Map<
        Event['type'],
        Set<(event: Event) => void>
    >();

    public addEventListener<T extends Event['type']>(
        messageType: T,
        listener: (event: Extract<Event, { type: T }>) => void,
    ): void {
        let listeners = this.listeners.get(messageType);
        if (listeners === undefined) {
            listeners = new Set();
            this.listeners.set(messageType, listeners);
        }
        listeners.add(listener as (event: Event) => void);
    }

    public removeEventListener<T extends Event['type']>(
        messageType: T,
        listener: (event: Extract<Event, { type: T }>) => void,
    ): void {
        const listeners = this.listeners.get(messageType);
        if (listeners === undefined) {
            return;
        }
        listeners.delete(listener as (event: Event) => void);
    }

    protected dispatchEvent<E extends Event>(event: E): void {
        const listeners = this.listeners.get(event.type);
        if (listeners === undefined) {
            return;
        }
        listeners.forEach(listener => {
            listener(event);
        });
    }
}
