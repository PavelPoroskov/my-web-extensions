import {
  logEvent,
} from '../api/log-api.js'
import {
  STORAGE_KEY,
  STORAGE_KEY_META,
} from '../constant/index.js'
import {
  memo,
} from '../api/memo.js'

export const storageController = {
  
  async onChanged(changes, namespace) {
    
    if (namespace === 'local') {
      const changesSet = new Set(Object.keys(changes))
      const settingSet = new Set([
        STORAGE_KEY.CLEAR_URL,
        STORAGE_KEY.SHOW_PATH_LAYERS,
        STORAGE_KEY.SHOW_PREVIOUS_VISIT,
        STORAGE_KEY.SHOW_BOOKMARK_TITLE,
        STORAGE_KEY.ADD_BOOKMARK_IS_ON,
        //STORAGE_KEY.ADD_BOOKMARK_LIST_SHOW,
        STORAGE_KEY.ADD_BOOKMARK_LIST_LIMIT,
        STORAGE_KEY.ADD_BOOKMARK_TAG_LENGTH
      ].map((key) => STORAGE_KEY_META[key].storageKey))
      const intersectSet = changesSet.intersection(settingSet)

      if (intersectSet.size > 0) {
        logEvent('storage.onChanged', namespace, changes);

        memo.invalidateSettings()

        if (changesSet.has(STORAGE_KEY.SHOW_PREVIOUS_VISIT)) {
          memo.cacheUrlToVisitList.clear()
        }
      }
    }
  },
};
