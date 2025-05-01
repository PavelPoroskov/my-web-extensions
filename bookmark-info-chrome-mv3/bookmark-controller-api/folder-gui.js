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
  let correctParentId

  const settings = await extensionSettings.get()

  if (settings[USER_OPTION.USE_FLAT_FOLDER_STRUCTURE]) {
    correctParentId = getNewFolderRootId(title)
  }

  const rootArray = [BOOKMARKS_BAR_FOLDER_ID, BOOKMARKS_MENU_FOLDER_ID, OTHER_BOOKMARKS_FOLDER_ID].filter(Boolean)

  const actualParentId = correctParentId || parentId
  if (rootArray.includes(actualParentId)) {
    const firstLevelNodeList = await chrome.bookmarks.getChildren(actualParentId)
    const findIndex = firstLevelNodeList.find((item) => title.localeCompare(item.title) < 0)

    const moveArgs = {}
    if (correctParentId && parentId != correctParentId) {
      moveArgs.parentId = correctParentId
    }
    if (findIndex) {
      moveArgs.index = findIndex.index
    }

    if (Object.keys(moveArgs).length > 0) {
      moveFolderIgnoreInController({
        id,
        ...moveArgs,
      })
    }
  }
}
