import {
  USER_OPTION_STORAGE_KEY_LIST,
} from '../constant/index.js'
import {
  extensionSettings,
} from '../api/structure/index.js'
import {
  makeLogFunction,
} from '../api/log-api.js'

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
