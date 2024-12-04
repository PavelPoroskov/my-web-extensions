import {
  createContextMenu,
} from '../api/context-menu.js'
import {
  debouncedUpdateActiveTab,
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
import {
  makeLogFunction,
} from '../api/log-api.js'

const logRC = makeLogFunction({ module: 'runtime.controller' })

export const runtimeController = {
  async onStartup() {
    logRC('runtime.onStartup');

    // is only firefox use it?
    createContextMenu()
    await initExtension({ debugCaller: 'runtime.onStartup' })
    debouncedUpdateActiveTab({
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
    logRC('runtime.onInstalled');

    createContextMenu()
    await initExtension({ debugCaller: 'runtime.onInstalled' })
    debouncedUpdateActiveTab({
      debugCaller: 'runtime.onInstalled'
    });
  },
  async onMessage (message, sender) {
    logRC('runtime.onMessage message', message);

    await onIncomingMessage(message, sender)
  }
};
