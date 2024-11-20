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
  flatBookmarks,
} from '../bookmark-list-ops/index.js'
import {
  getOptions,
} from '../api/storage-api.js'
import {
  STORAGE_KEY,
} from '../constant/index.js';
import {
  onIncomingMessage,
} from './incoming-message.js'
import { initExtension } from '../api/init-extension.js'

export const runtimeController = {
  async onStartup() {
    logEvent('runtime.onStartup');
    // is only firefox use it?
    createContextMenu()
    await initExtension()
    updateActiveTab({
      debugCaller: 'runtime.onStartup'
    });

    const savedObj = await getOptions([
      STORAGE_KEY.FORCE_FLAT_FOLDER_STRUCTURE,
    ]);

    if (savedObj[STORAGE_KEY.FORCE_FLAT_FOLDER_STRUCTURE]) {
      await flatBookmarks()
    }
  },
  async onInstalled () {
    logEvent('runtime.onInstalled');
    createContextMenu()
    await initExtension()
    updateActiveTab({
      debugCaller: 'runtime.onInstalled'
    });
  },
  async onMessage (message, sender) {
    logEvent('runtime.onMessage message', message);

    await onIncomingMessage(message, sender)
  }
};
