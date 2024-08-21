import {
  extensionSettings,
} from '../structure/index.js'

export async function switchShowRecentList(isShow) {
  await extensionSettings.update({
    [STORAGE_KEY.ADD_BOOKMARK_LIST_SHOW]: isShow
  })
}