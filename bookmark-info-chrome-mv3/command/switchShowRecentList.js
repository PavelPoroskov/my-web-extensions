import {
  extensionSettings,
} from '../data-structures/index.js'
import {
  INTERNAL_VALUES,
} from '../api/storage.api.config.js'

export async function switchShowRecentList(isShow) {
  await extensionSettings.update({
    [INTERNAL_VALUES.TAG_LIST_IS_OPEN]: isShow
  })
}
