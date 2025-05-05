import {
  USER_OPTION,
} from '../constant/index.js'
import {
  BOOKMARKS_BAR_FOLDER_ID,
  BOOKMARKS_MENU_FOLDER_ID,
  OTHER_BOOKMARKS_FOLDER_ID,
  getNewFolderRootId,
} from '../folder-api/index.js'
import {
  moveFolderIgnoreInController,
} from './folder-ignore.js'
import {
  extensionSettings,
} from '../api-mid/index.js'

export async function afterUserCreatedFolderInGUI({ id, parentId, title }) {
  const moveArgs = {}
  const settings = await extensionSettings.get()

  if (settings[USER_OPTION.USE_FLAT_FOLDER_STRUCTURE]) {
    const correctParentId = getNewFolderRootId(title)

    if (parentId != correctParentId) {
      moveArgs.parentId = correctParentId
    }
  }

  const rootArray = [BOOKMARKS_BAR_FOLDER_ID, BOOKMARKS_MENU_FOLDER_ID, OTHER_BOOKMARKS_FOLDER_ID].filter(Boolean)
  const finalParentId = moveArgs.parentId || parentId

  if (rootArray.includes(finalParentId)) {
    const firstLevelNodeList = await chrome.bookmarks.getChildren(finalParentId)
    const findIndex = firstLevelNodeList.find((item) => title.localeCompare(item.title) < 0)

    if (findIndex) {
      moveArgs.index = findIndex.index
    }
  }

  if (0 < Object.keys(moveArgs).length) {
    moveFolderIgnoreInController({
      id,
      ...moveArgs,
    })
  }
}
