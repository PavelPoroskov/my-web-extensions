import {
  createContextMenu,
} from '../api/context-menu.js'
import {
  logEvent
} from '../api/log-api.js'
import {
  getOptions,
} from '../api/storage-api.js'
import {
  sortFoldersService,
} from '../api/structure/index.js'
import {
  updateActiveTab,
} from '../api/tabs-api.js'
import {
  STORAGE_KEY,
} from '../constant/index.js'
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

    const savedObj = await getOptions([
      STORAGE_KEY.FORCE_FLAT_FOLDER_STRUCTURE,
    ]);

    if (savedObj[STORAGE_KEY.FORCE_FLAT_FOLDER_STRUCTURE]) {
      await sortFoldersService.start()
    }
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
