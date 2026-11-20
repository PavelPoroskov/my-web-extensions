import { updateActiveTab } from '../api/index.js'
import { orderBookmarkTree } from '../bookmark-tree/index.js'
import { migration } from '../migration/index.js'
import {
  DATA_FORMAT,
  INTERNAL_VALUES,
  USER_OPTION,
} from '../constant/index.js'
import { onIncomingMessage } from './incoming-message.js'
import { initExtension } from '../api/init-extension.js'
import {
  getOptions,
  makeLogFunction,
} from '../api-low/index.js'

const logRC = makeLogFunction({ module: 'runtime.controller' })

async function onStartup() {
  logRC('runtime.onStartup');

  await initExtension({ debugCaller: 'runtime.onStartup' })
  updateActiveTab({
    debugCaller: 'runtime.onStartup'
  });

  const savedObj = await getOptions([
    INTERNAL_VALUES.DATA_FORMAT,
    USER_OPTION.USE_FLAT_FOLDER_STRUCTURE,
  ]);

  if (savedObj[INTERNAL_VALUES.DATA_FORMAT] !== DATA_FORMAT) {
    await migration({ from: savedObj[INTERNAL_VALUES.DATA_FORMAT] })
  }

  if (savedObj[USER_OPTION.USE_FLAT_FOLDER_STRUCTURE]) {
    await orderBookmarkTree()
  }
}

export const runtimeController = {
  async onStartup() {
    setTimeout(() => {
      onStartup()
    },5000)
  },
  async onInstalled () {
    logRC('runtime.onInstalled');

    await initExtension({ debugCaller: 'runtime.onInstalled' })
    updateActiveTab({
      debugCaller: 'runtime.onInstalled'
    });

    const savedObj = await getOptions([
      INTERNAL_VALUES.DATA_FORMAT,
      USER_OPTION.USE_FLAT_FOLDER_STRUCTURE,
    ]);

    if (savedObj[INTERNAL_VALUES.DATA_FORMAT] !== DATA_FORMAT) {
      await migration({ from: savedObj[INTERNAL_VALUES.DATA_FORMAT] })

      if (savedObj[USER_OPTION.USE_FLAT_FOLDER_STRUCTURE]) {
        orderBookmarkTree()
      }
    }

    //? chrome.runtime.reload() to fix empty page options after update
  },
  async onMessage (message, sender) {
    logRC('runtime.onMessage message', message);

    await onIncomingMessage(message, sender)
  }
};
