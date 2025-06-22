import {
  USER_OPTION,
} from '../constant/index.js'
import {
  BUILTIN_BROWSER_ROOT_FOLDER_MAP,
  getNewFolderRootId,
} from '../folder-api/index.js'
import {
  moveFolderIgnoreInController,
} from './folder-ignore.js'
import {
  extensionSettings,
} from '../api-mid/index.js'

export async function moveFolderAfterRename({ id, parentId, title, index }) {
  const moveArgs = {}
  const settings = await extensionSettings.get()

  if (settings[USER_OPTION.USE_FLAT_FOLDER_STRUCTURE]) {
    const correctParentId = getNewFolderRootId(title)

    if (parentId != correctParentId) {
      moveArgs.parentId = correctParentId
    }
  }

  const finalParentId = moveArgs.parentId || parentId

  if (finalParentId in BUILTIN_BROWSER_ROOT_FOLDER_MAP) {
    const firstLevelNodeList = await chrome.bookmarks.getChildren(finalParentId)
    const findIndex = firstLevelNodeList.find((item) => title.localeCompare(item.title) < 0)

    if (index != findIndex) {
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
