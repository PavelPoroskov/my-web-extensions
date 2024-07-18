import {
  logEvent
} from '../api/log-api.js'
import {
  createContextMenu,
} from '../api/context-menu.js'
import {
  updateActiveTab,
} from '../api/tabs-api.js'
import {
  onIncomingMessage,
} from './incoming-message.js'

export const runtimeController = {
  async onStartup() {
    logEvent('runtime.onStartup');
    // is only firefox use it?
    createContextMenu()
    updateActiveTab({
      useCache: true,
      debugCaller: 'runtime.onStartup'
    });
  },
  async onInstalled () {
    logEvent('runtime.onInstalled');
    createContextMenu()
    updateActiveTab({
      useCache: true,
      debugCaller: 'runtime.onInstalled'
    });
  },
  async onMessage (message, sender) {
    logEvent('runtime.onMessage message', message);

    await onIncomingMessage(message, sender)
  }
};
