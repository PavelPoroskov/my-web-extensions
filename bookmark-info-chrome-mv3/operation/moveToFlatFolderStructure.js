import { flatBookmarks } from '../api/flat-structure-api.js'
import {
  STORAGE_KEY,
} from '../constant/index.js';
import {
  setOptions
} from '../api/storage-api.js'
import {
  memo,
} from '../api/memo.js'

export async function moveToFlatFolderStructure() {
  await setOptions({
    [STORAGE_KEY.FORCE_FLAT_FOLDER_STRUCTURE]: true
  })
  await memo.readSettings()
  await memo.filterTagList()

  await flatBookmarks()
}