import {
  isDatedFolderTitle,
  isTopFolder,
  getDatedRootFolderId,
  BOOKMARKS_BAR_FOLDER_ID,
  BOOKMARKS_MENU_FOLDER_ID,
  OTHER_BOOKMARKS_FOLDER_ID,
  UNCLASSIFIED_TITLE,
  DATED_TITLE,
} from '../folder-api/index.js'
import {
  getOrCreateFolderByTitleInRoot,
} from '../bookmark-controller-api/index.js'
import {
  tagList,
} from '../data-structures/index.js'
import {
  flatFolders,
} from './flatFolders.js'
import {
  mergeFolders,
} from './mergeFolders.js'
import {
  moveNotDescriptiveFoldersToUnclassified,
} from './moveNotDescriptiveFolders.js'
import {
  moveRootBookmarksToUnclassified,
} from './moveRootBookmarks.js'
import {
  moveFoldersByName,
  moveOldDatedFolders,
} from './moveFoldersByName.js'
import {
  removeDoubleBookmarks,
} from './removeDoubleBookmarks.js'
import {
  sortFolders,
} from './sortFolders.js'
import {
  IS_BROWSER_FIREFOX,
} from '../constant/index.js'

export async function flatBookmarks() {
  tagList.blockTagList(true)

  try {
    await getOrCreateFolderByTitleInRoot(UNCLASSIFIED_TITLE)
    await getOrCreateFolderByTitleInRoot(DATED_TITLE)

    const datedRootFolderId = await getDatedRootFolderId()

    if (IS_BROWSER_FIREFOX) {
      await moveFoldersByName({
        fromId: BOOKMARKS_MENU_FOLDER_ID,
        toId: OTHER_BOOKMARKS_FOLDER_ID,
        isCondition: (title) => !isDatedFolderTitle(title)
      })
    }

    await flatFolders()
    await moveRootBookmarksToUnclassified()
    await moveNotDescriptiveFoldersToUnclassified()

    await moveOldDatedFolders({
      fromId: BOOKMARKS_BAR_FOLDER_ID,
      toId: datedRootFolderId,
    })
    if (IS_BROWSER_FIREFOX) {
      await moveOldDatedFolders({
        fromId: BOOKMARKS_MENU_FOLDER_ID,
        toId: datedRootFolderId,
      })
    }
    await moveFoldersByName({
      fromId: BOOKMARKS_BAR_FOLDER_ID,
      toId: OTHER_BOOKMARKS_FOLDER_ID,
      isCondition: IS_BROWSER_FIREFOX
        ? (title) => !isTopFolder(title)
        : (title) => !(isTopFolder(title) || isDatedFolderTitle(title))
    })
    await moveFoldersByName({
      fromId: OTHER_BOOKMARKS_FOLDER_ID,
      toId: BOOKMARKS_BAR_FOLDER_ID,
      isCondition: (title) => isTopFolder(title)
    })

    await mergeFolders()

    await sortFolders(BOOKMARKS_BAR_FOLDER_ID)
    if (IS_BROWSER_FIREFOX) {
      await sortFolders(BOOKMARKS_MENU_FOLDER_ID)
    }
    await sortFolders(OTHER_BOOKMARKS_FOLDER_ID)
    await sortFolders(datedRootFolderId)

    await removeDoubleBookmarks()

  } finally {
    tagList.blockTagList(false)
  }
}
