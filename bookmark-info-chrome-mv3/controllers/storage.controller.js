import {
  logEvent,
} from '../api/debug.js'
import {
  USER_SETTINGS_OPTIONS,
} from '../constants.js'
import {
  memo,
} from '../api/memo.js'

export const storageController = {
  
  async onChanged(changes, namespace) {
    
    if (namespace === 'local') {
      const changesSet = new Set(Object.keys(changes))
      const settingSet = new Set(Object.values(USER_SETTINGS_OPTIONS))
      const intersectSet = changesSet.intersect(settingSet)

      if (intersectSet.size > 0) {
        logEvent('storage.onChanged', namespace, changes);

        memo.invalidateSettings()

        if (changesSet.has(USER_SETTINGS_OPTIONS.SHOW_PREVIOUS_VISIT)) {
          memo.cacheUrlToVisitList.clear()
        }
      }
    }
  },
};
