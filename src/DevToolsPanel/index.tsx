import { DevPanelMessenger } from '../Communication/DevPanelMessenger';
import ReactDOM from 'react-dom/client';
import React from 'react';
import { DevToolsPanel } from './Components/DevToolsPanel';
import { type Message, type WorkerMessage } from '../Messages';
import { resetState } from './Store';
import { setupHandlers } from './Handlers';
import {
    ShaderMaterialEditorController,
    ShaderMaterialEditorControllerProvider,
} from './Controller/ShaderMaterialEditorController';
import { type MessengerInterface } from '../Communication/MessengerInterface';
import { type ShaderMaterialEditorMessage } from '../Messages/ShaderMaterialEditorMessage';
import { DevPanelWorkerMessenger } from '../Communication/DevPanelWorkerMessenger';

// This is the main entry to the devtools-panel.

// Messenger for communication between devtools-panel and injected script:
const messenger = new DevPanelMessenger<Message>();
// Messenger for communication between devtools-panel and service worker:
const workerMessenger = new DevPanelWorkerMessenger<WorkerMessage>();

setupHandlers(messenger);

workerMessenger.on('InjectedContentScript', () => {
    messenger.post({
        type: 'RequestReportFullScene',
    });
});

function executeContentScript(): void {
    workerMessenger.post({
        type: 'InjectContentScript',
        tabId: chrome.devtools.inspectedWindow.tabId,
    });
}

// Request to execute content script as soon as the panel is opened.
executeContentScript();

// If the tab we are inspecting is reloaded, reset the store states and execute
// the content script again.
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (tabId !== chrome.devtools.inspectedWindow.tabId) {
        return;
    }
    if (changeInfo.status === 'complete') {
        // Tab was reloaded. We execute the script again and reset the DevTools:
        resetState();
        executeContentScript();
    }
});

// UI entry
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <ShaderMaterialEditorControllerProvider
            value={
                new ShaderMaterialEditorController(
                    messenger as MessengerInterface<ShaderMaterialEditorMessage>,
                )
            }>
            <DevToolsPanel />
        </ShaderMaterialEditorControllerProvider>
    </React.StrictMode>,
);
