import { flatBookmarks } from '../bookmark-list-ops/index.js'
import {
  USER_OPTION,
} from '../api/storage.api.config.js'
import {
  extensionSettings,
  tagList,
} from '../api/structure/index.js'

export async function moveToFlatFolderStructure() {
  await extensionSettings.update({
    [USER_OPTION.USE_FLAT_FOLDER_STRUCTURE]: true,
  })

  await flatBookmarks()
  await tagList.filterTagListForFlatFolderStructure()
}
