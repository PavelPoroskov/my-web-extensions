import {
  logEvent,
} from '../api/log-api.js'
import {
  STORAGE_KEY,
  STORAGE_KEY_META,
} from '../constant/index.js'
import {
  extensionSettings,
  memo,
} from '../api/structure/index.js'

export const storageController = {
  
  async onChanged(changes, namespace) {
    
    if (namespace === 'local') {
      const changesSet = new Set(Object.keys(changes))
      // TODO? do we need invalidate setting for all this keys
      const settingSet = new Set([
        STORAGE_KEY.ADD_BOOKMARK_HIGHLIGHT_LAST,
        STORAGE_KEY.ADD_BOOKMARK_IS_ON,
        STORAGE_KEY.ADD_BOOKMARK_LIST_LIMIT,
        // STORAGE_KEY.ADD_BOOKMARK_LIST_SHOW,
        STORAGE_KEY.ADD_BOOKMARK_TAG_LENGTH,
        STORAGE_KEY.CLEAR_URL,
        STORAGE_KEY.FORCE_FLAT_FOLDER_STRUCTURE,
        STORAGE_KEY.SHOW_BOOKMARK_TITLE,
        STORAGE_KEY.SHOW_PATH_LAYERS,
        STORAGE_KEY.SHOW_PREVIOUS_VISIT,
      ].map((key) => STORAGE_KEY_META[key].storageKey))
      const intersectSet = changesSet.intersection(settingSet)

      if (intersectSet.size > 0) {
        logEvent('storage.onChanged', namespace, changes);

        extensionSettings.invalidate()

        if (changesSet.has(STORAGE_KEY.SHOW_PREVIOUS_VISIT)) {
          memo.cacheUrlToVisitList.clear()
        }
      }
    }
  },
};
