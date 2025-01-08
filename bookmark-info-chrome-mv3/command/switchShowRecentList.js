import {
  extensionSettings,
} from '../data-structures/index.js'
import {
  INTERNAL_VALUES,
} from '../constant/index.js'

export async function switchShowRecentList(isShow) {
  await extensionSettings.update({
    [INTERNAL_VALUES.TAG_LIST_IS_OPEN]: isShow
  })
}
