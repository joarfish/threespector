import { ServiceWorkerDevPanelMessenger } from './Communication/ServiceWorkerDevPanelMessenger';
import { type WorkerMessage } from './Messages/WorkerMessages';

// A map of connections from devtools-panels to this worker. The keys are the tabIds
// of the windows/tabs that the respective devtools-panel is inspecting.
const connections = new Map<number, chrome.runtime.Port>();
// Remember in which tabs the content script has already been executed to avoid multiple
// execution. The entries are tabIds.
const contentScriptInjected = new Set<number>();

// Listens for messages from contentScript and the initial handshake message.
// The initial handshake provides the contentScript with its own tabId.
chrome.runtime.onMessage.addListener((event, sender, sendResponse) => {
    if (
        'type' in event &&
        event.type === 'handshake' &&
        sender.tab !== undefined
    ) {
        sendResponse({
            type: 'handshake',
            tabId: sender.tab?.id,
        });
    } else if (
        'direction' in event &&
        event.direction === 'content-to-worker' &&
        'message' in event &&
        'tabId' in event
    ) {
        const connection = connections.get(event.tabId);
        if (connection === undefined) {
            return;
        }
        connection.postMessage(event.message);
    }
});

/**
 * Message handler passing messages from devtools-panel to content-script.
 * @param message
 * @param port
 */
function passthroughMessageHandler(
    message: any,
    port: chrome.runtime.Port,
): void {
    if ('type' in message && message.type === 'init' && 'tabId' in message) {
        connections.set(message.tabId, port);
    } else if (
        'type' in message &&
        message.type === 'send-message' &&
        'tabId' in message &&
        'message' in message
    ) {
        chrome.tabs.sendMessage(message.tabId, {
            direction: 'worker-to-content',
            message: message.message,
        });
    }
}

/**
 * Handles incoming connections from the devtools panel. This connection
 * is used for passing through messages to the content script.
 * @param port
 */
function handlePassthroughConnection(port: chrome.runtime.Port): void {
    port.onMessage.addListener(passthroughMessageHandler);
    port.onDisconnect.addListener(() => {
        let tabIdToRemove = null;
        for (const [tabId, connectionPort] of connections.entries()) {
            if (port === connectionPort) {
                tabIdToRemove = tabId;
                break;
            }
        }
        if (tabIdToRemove !== null) {
            connections.delete(tabIdToRemove);
        }
        port.onMessage.removeListener(passthroughMessageHandler);
    });
}

/**
 * Handles incoming connection from devtools panel. This connection is
 * used for communicating between worker and dev tools panel.
 * @param port
 */
function handleDevtoolsConnection(port: chrome.runtime.Port): void {
    const messenger = new ServiceWorkerDevPanelMessenger<WorkerMessage>(port);
    // This is currently the only type of message that is handled here:
    messenger.on('InjectContentScript', message => {
        // If content script has already been injected, just report success:
        if (contentScriptInjected.has(message.tabId)) {
            messenger.post({
                type: 'InjectedContentScript',
            });
            return;
        }

        // ... otherwise, inject content script:
        chrome.scripting
            .executeScript({
                target: { tabId: message.tabId },
                files: ['contentScript.js'],
            })
            .then(() => {
                // Remember content script has been injected for
                // this tab.
                contentScriptInjected.add(message.tabId);
                messenger.post({
                    type: 'InjectedContentScript',
                });
            })
            .catch(error => {
                messenger.post({
                    type: 'ErrorInjectingContentScript',
                    error:
                        typeof error === 'string'
                            ? error
                            : error instanceof Error
                            ? error.message
                            : 'Unknown error',
                });
            });
    });
}

// Handle incoming connections
chrome.runtime.onConnect.addListener(port => {
    if (port.name === 'devtools-passthrough') {
        handlePassthroughConnection(port);
    } else if (port.name === 'devtools-worker') {
        handleDevtoolsConnection(port);
    }
});

// If a tab is reloaded, we need to check whether it had a content script executed
// and if so forget about this:
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (!contentScriptInjected.has(tabId) || changeInfo.status !== 'loading') {
        return;
    }
    contentScriptInjected.delete(tabId);
});
