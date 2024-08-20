import { flatBookmarks } from '../api/flat-structure-api.js'
import {
  STORAGE_KEY,
} from '../constant/index.js';
import {
  memo,
} from '../api/memo.js'
import {
  tagList,
} from '../api/tagList.js'

export async function moveToFlatFolderStructure() {
  await memo.updateSettings({
    [STORAGE_KEY.FORCE_FLAT_FOLDER_STRUCTURE]: true
  })
  await tagList.filterTagListForFlatFolderStructure()

  await flatBookmarks()
}