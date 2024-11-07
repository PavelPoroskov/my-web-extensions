import {
  getOrCreateUnclassifiedFolderId,
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
  moveTodoToBkmBar,
} from './moveTodoToBkmBar.js';
import {
  removeDoubleBookmarks,
} from './removeDoubleBookmarks.js';
import {
  sortFolders,
} from './sortFolders.js';


export async function flatBookmarks() {
  tagList.blockTagList(true)

  try {  
    await getOrCreateUnclassifiedFolderId()
  
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
