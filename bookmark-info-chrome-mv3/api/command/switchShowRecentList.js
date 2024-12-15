import {
  extensionSettings,
} from '../structure/index.js'
import {
  INTERNAL_VALUES,
} from '../storage.api.config.js'

export async function switchShowRecentList(isShow) {
  await extensionSettings.update({
    [INTERNAL_VALUES.TAG_LIST_IS_OPEN]: isShow
  })
}