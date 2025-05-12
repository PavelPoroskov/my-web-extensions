import {
  USER_OPTION_STORAGE_KEY_LIST,
} from '../constant/index.js'
import {
  extensionSettings,
} from '../api-mid/index.js'
import { initExtension } from '../api/init-extension.js'
import {
  makeLogFunction,
} from '../api-low/index.js'

const logSC = makeLogFunction({ module: 'storage.controller' })

export const storageController = {

  async onChanged(changes, namespace) {

    if (namespace === 'local') {
      const changesSet = new Set(Object.keys(changes))
      const userOptionSet = new Set(USER_OPTION_STORAGE_KEY_LIST)
      const intersectSet = changesSet.intersection(userOptionSet)

      if (intersectSet.size > 0) {
        logSC('storage.onChanged', namespace, changes);

        extensionSettings.invalidate()
        await initExtension({ debugCaller: 'storage.onChanged' })
      }
    }
  },
};
