import {
  getOrCreateUnclassifiedFolderId,
  BOOKMARKS_MENU_FOLDER_ID,
  OTHER_BOOKMARKS_FOLDER_ID,
} from '../api/special-folder.api.js';
import {
  tagList,
} from '../api/structure/index.js';
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
  moveFolderByName,
  moveTodoToBkmBar,
} from './moveTodoToBkmBar.js';
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

    if (IS_BROWSER_FIREFOX) {
      await moveFolderByName({
        fromId: BOOKMARKS_MENU_FOLDER_ID,
        toId: OTHER_BOOKMARKS_FOLDER_ID,
      })
    }

    await flatFolders()
    await moveRootBookmarksToUnclassified()
    await moveNotDescriptiveFoldersToUnclassified()
    await moveTodoToBkmBar()
    await mergeFolders()
    await sortFolders()
    await removeDoubleBookmarks()

  } finally {
    tagList.blockTagList(false)
  }
}
