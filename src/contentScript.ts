const result = document.querySelector('[data-injection-done=true]');

/**
 * Check if a message comes from the injected script.
 * @param data
 */
function isMessageFromInjected(data: unknown): boolean {
    return (
        data !== null &&
        typeof data === 'object' &&
        'direction' in data &&
        data.direction === 'injected-to-content' &&
        'message' in data
    );
}

/**
 * Check if a message comes from the service worker.
 * @param data
 */
function isMessageFromWorker(data: unknown): boolean {
    return (
        data !== null &&
        typeof data === 'object' &&
        'direction' in data &&
        data.direction === 'worker-to-content' &&
        'message' in data
    );
}

// Module state to store the tabId of the tab this content script was executed
// in. Will be set when handshake with service worker was successful.
let tabId: null | number = null;

/**
 * Initiates handshake
 */
function handshake(): void {
    chrome.runtime
        .sendMessage({
            type: 'handshake',
        })
        .then(response => {
            if (
                'type' in response &&
                response.type === 'handshake' &&
                'tabId' in response
            ) {
                tabId = response.tabId as number;
                chrome.runtime.sendMessage({
                    direction: 'content-to-worker',
                    message: {
                        type: 'StartSession',
                    },
                    tabId,
                });
            }
        })
        .catch(() => {});
}

/**
 * Initiates the relaying of messages from injected script to service worker and
 * vice versa.
 */
function initRelay(): void {
    // Handle messages from injected script:
    window.addEventListener(
        'message',
        event => {
            if (isMessageFromInjected(event.data) && tabId !== null) {
                chrome.runtime.sendMessage({
                    direction: 'content-to-worker',
                    message: event.data.message,
                    tabId,
                });
            }
        },
        false,
    );

    // Handle messages from worker:
    chrome.runtime.onMessage.addListener(message => {
        if (!isMessageFromWorker(message)) {
            return;
        }

        window.postMessage({
            direction: 'content-to-injected',
            message: message.message,
        });
    });
}

// Only inject the script again if it hasn't been yet. This is
// a precaution to avoid injecting it multiple times.
if (result === null) {
    initRelay();
    // Inject script:
    const scriptElement = document.createElement('script');
    scriptElement.src = chrome.runtime.getURL('injectedScript.js');
    scriptElement.setAttribute('type', 'module');
    scriptElement.setAttribute('data-injection-done', 'true');
    scriptElement.addEventListener('load', () => {
        handshake();
        scriptElement.remove();
    });
    document.head.appendChild(scriptElement);
}
