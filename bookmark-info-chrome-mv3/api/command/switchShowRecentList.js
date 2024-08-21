import {
  extensionSettings,
} from '../structure/index.js'
import {
  STORAGE_KEY,
} from '../../constant/index.js';

export async function switchShowRecentList(isShow) {
  await extensionSettings.update({
    [STORAGE_KEY.ADD_BOOKMARK_LIST_SHOW]: isShow
  })
}