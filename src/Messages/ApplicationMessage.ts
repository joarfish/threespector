// Application messages are those that have global or general effect.

type StartSession = {
    type: 'StartSession';
};

export type ApplicationMessage = StartSession;
