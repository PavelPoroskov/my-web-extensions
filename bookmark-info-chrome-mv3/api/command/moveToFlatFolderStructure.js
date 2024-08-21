import { flatBookmarks } from '../api/flat-structure-api.js'
import {
  STORAGE_KEY,
} from '../../constant/index.js';
import {
  extensionSettings,
  tagList,
} from '../structure/index.js'

export async function moveToFlatFolderStructure() {
  await extensionSettings.update({
    [STORAGE_KEY.FORCE_FLAT_FOLDER_STRUCTURE]: true
  })
  await tagList.filterTagListForFlatFolderStructure()

  await flatBookmarks()
}