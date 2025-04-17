import {
  flatFolders,
  orderBookmarks,
} from '../bookmark-list-ops/index.js'
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
  const settings = await extensionSettings.get()

  if (!settings[USER_OPTION.USE_FLAT_FOLDER_STRUCTURE]) {
    await extensionSettings.update({
      [USER_OPTION.USE_FLAT_FOLDER_STRUCTURE]: true,
    })

    await flatFolders()
  }

  await orderBookmarks()
  await tagList.filterTagListForFlatFolderStructure()
}
