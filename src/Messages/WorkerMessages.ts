type InjectContentScript = { type: 'InjectContentScript'; tabId: number };

type InjectedContentScript = {
    type: 'InjectedContentScript';
};

type ErrorInjectingContentScript = {
    type: 'ErrorInjectingContentScript';
    error: string;
};

// Messages that are used between Worker and DevTools-Panel
export type WorkerMessage =
    | InjectContentScript
    | InjectedContentScript
    | ErrorInjectingContentScript;
