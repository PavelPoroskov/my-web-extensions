import {
  USER_OPTION_STORAGE_KEY_LIST,
} from '../api/storage.api.js'
import {
  extensionSettings,
} from '../data-structures/index.js'
import {
  makeLogFunction,
} from '../api-low/log.api.js'

const logSC = makeLogFunction({ module: 'storage.controller' })

export const storageController = {

  onChanged(changes, namespace) {

    if (namespace === 'local') {
      const changesSet = new Set(Object.keys(changes))
      const userOptionSet = new Set(USER_OPTION_STORAGE_KEY_LIST)
      const intersectSet = changesSet.intersection(userOptionSet)

      if (intersectSet.size > 0) {
        logSC('storage.onChanged', namespace, changes);

        extensionSettings.invalidate()
      }
    }
  },
};
