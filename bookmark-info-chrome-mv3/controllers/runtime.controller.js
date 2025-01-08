import {
  debouncedUpdateActiveTab,
} from '../api/tabs.api.js'
import {
  flatBookmarks,
} from '../bookmark-list-ops/index.js'
import {
  getOptions,
} from '../api/storage.api.js'
import {
  USER_OPTION,
} from '../api/storage.api.js'
import {
  onIncomingMessage,
} from './incoming-message.js'
import { initExtension } from '../api/init-extension.js'
import {
  makeLogFunction,
} from '../api-low/log.api.js'

const logRC = makeLogFunction({ module: 'runtime.controller' })

export const runtimeController = {
  async onStartup() {
    logRC('runtime.onStartup');

    await initExtension({ debugCaller: 'runtime.onStartup' })
    debouncedUpdateActiveTab({
      debugCaller: 'runtime.onStartup'
    });

    const savedObj = await getOptions([
      USER_OPTION.USE_FLAT_FOLDER_STRUCTURE,
    ]);

    if (savedObj[USER_OPTION.USE_FLAT_FOLDER_STRUCTURE]) {
      await flatBookmarks()
    }
  },
  async onInstalled () {
    logRC('runtime.onInstalled');

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
