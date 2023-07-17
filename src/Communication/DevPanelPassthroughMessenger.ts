import { BaseDevPanelMessenger } from './BaseDevPanelMessenger';

export class DevPanelPassthroughMessenger<
    Messages extends { type: string },
> extends BaseDevPanelMessenger<Messages> {
    protected transformMessage(message: Messages): Record<string, unknown> {
        return {
            type: 'send-message',
            tabId: chrome.devtools.inspectedWindow.tabId,
            message,
        };
    }
}
