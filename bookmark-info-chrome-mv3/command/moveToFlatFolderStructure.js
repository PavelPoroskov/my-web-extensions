import { flatBookmarks } from '../bookmark-list-ops/index.js'
import {
  USER_OPTION,
} from '../constant/index.js'
import {
  extensionSettings,
} from '../api-low/index.js'
import {
  tagList,
} from '../data-structures/index.js'

export async function moveToFlatFolderStructure() {
  await extensionSettings.update({
    [USER_OPTION.USE_FLAT_FOLDER_STRUCTURE]: true,
  })

  await flatBookmarks()
  await tagList.filterTagListForFlatFolderStructure()
}
