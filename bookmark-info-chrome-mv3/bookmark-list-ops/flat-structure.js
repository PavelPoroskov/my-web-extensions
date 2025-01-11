import {
  isDatedFolderTitle,
  isStartWithTODO,
} from '../api-low/index.js';
import {
  getDatedRootFolderId,
  getOrCreateDatedRootFolderId,
  getOrCreateUnclassifiedFolderId,
  BOOKMARKS_BAR_FOLDER_ID,
  BOOKMARKS_MENU_FOLDER_ID,
  OTHER_BOOKMARKS_FOLDER_ID,
} from '../api/special-folder.api.js';
import {
  tagList,
} from '../data-structures/index.js';
import {
  flatFolders,
} from './flatFolders.js';
import {
  mergeFolders,
} from './mergeFolders.js';
import {
  moveNotDescriptiveFoldersToUnclassified,
} from './moveNotDescriptiveFolders.js';
import {
  moveRootBookmarksToUnclassified,
} from './moveRootBookmarks.js';
import {
  moveFoldersByName,
  moveOldDatedFolders,
} from './moveFoldersByName.js';
import {
  removeDoubleBookmarks,
} from './removeDoubleBookmarks.js';
import {
  sortFolders,
} from './sortFolders.js';
import {
  IS_BROWSER_FIREFOX,
} from '../constant/index.js';

export async function flatBookmarks() {
  tagList.blockTagList(true)

  try {
    await getOrCreateUnclassifiedFolderId()
    await getOrCreateDatedRootFolderId()
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

    await moveFoldersByName({
      fromId: BOOKMARKS_BAR_FOLDER_ID,
      toId: OTHER_BOOKMARKS_FOLDER_ID,
      isCondition: (title) => !(isStartWithTODO(title) || isDatedFolderTitle(title))
    })
    await moveFoldersByName({
      fromId: OTHER_BOOKMARKS_FOLDER_ID,
      toId: BOOKMARKS_BAR_FOLDER_ID,
      isCondition: (title) => isStartWithTODO(title)
    })
    await moveOldDatedFolders({
      fromId: BOOKMARKS_MENU_FOLDER_ID || BOOKMARKS_BAR_FOLDER_ID,
      toId: datedRootFolderId,
    })

    await mergeFolders()

    await sortFolders(BOOKMARKS_BAR_FOLDER_ID)
    await sortFolders(OTHER_BOOKMARKS_FOLDER_ID)
    await sortFolders(datedRootFolderId)
    if (IS_BROWSER_FIREFOX) {
      await sortFolders(BOOKMARKS_MENU_FOLDER_ID)
    }

    await removeDoubleBookmarks()

  } finally {
    tagList.blockTagList(false)
  }
}
