import {
  debouncedUpdateActiveTab,
} from '../api/index.js'
import {
  orderBookmarks,
} from '../bookmark-list-ops/index.js'
import {
  USER_OPTION,
} from '../constant/index.js'
import {
  onIncomingMessage,
} from './incoming-message.js'
import { initExtension } from '../api/init-extension.js'
import {
  getOptions,
  makeLogFunction,
} from '../api-low/index.js'

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
      await orderBookmarks()
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
