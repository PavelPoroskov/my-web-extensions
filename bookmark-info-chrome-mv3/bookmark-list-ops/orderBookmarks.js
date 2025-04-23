import {
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
} from '../api-mid/index.js'
import {
  moveFolders,
} from './moveFolders.js'
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
  moveOldDatedFolders,
} from './moveOldDatedFolders.js'
import {
  removeDoubleBookmarks,
} from './removeDoubleBookmarks.js'
import {
  sortFolders,
} from './sortFolders.js'
import {
  IS_BROWSER_FIREFOX,
} from '../constant/index.js'

export async function orderBookmarks() {
  tagList.blockTagList(true)

  try {
    await getOrCreateFolderByTitleInRoot(UNCLASSIFIED_TITLE)
    await getOrCreateFolderByTitleInRoot(DATED_TITLE)

    await moveFolders()
    await moveOldDatedFolders(BOOKMARKS_BAR_FOLDER_ID)
    if (IS_BROWSER_FIREFOX) {
      await moveOldDatedFolders(BOOKMARKS_MENU_FOLDER_ID)
    }

    await moveRootBookmarksToUnclassified()
    await moveNotDescriptiveFoldersToUnclassified()

    await mergeFolders()

    await sortFolders(BOOKMARKS_BAR_FOLDER_ID)
    if (IS_BROWSER_FIREFOX) {
      await sortFolders(BOOKMARKS_MENU_FOLDER_ID)
    }
    await sortFolders(OTHER_BOOKMARKS_FOLDER_ID)

    await removeDoubleBookmarks()

  } finally {
    tagList.blockTagList(false)
  }
}
