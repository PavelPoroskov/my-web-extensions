import {
  BOOKMARKS_BAR_FOLDER_ID,
  BOOKMARKS_MENU_FOLDER_ID,
  OTHER_BOOKMARKS_FOLDER_ID,
  UNCLASSIFIED_TITLE,
  DATED_TITLE,
} from '../folder-api/index.js'
import {
  findOrCreateFolderByTitleInRoot,
} from '../bookmark-controller-api/index.js'
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
import {
  makeLogFunction,
} from '../api-low/index.js';

const logOD = makeLogFunction({ module: 'orderBookmarks.js' })

export async function orderBookmarks() {
  logOD('orderBookmarks() 00')

  await findOrCreateFolderByTitleInRoot(UNCLASSIFIED_TITLE)
  await findOrCreateFolderByTitleInRoot(DATED_TITLE)

  logOD('orderBookmarks() 11')
  await moveFolders()
  logOD('orderBookmarks() 11.2')
  await moveOldDatedFolders(BOOKMARKS_BAR_FOLDER_ID)
  if (IS_BROWSER_FIREFOX) {
    await moveOldDatedFolders(BOOKMARKS_MENU_FOLDER_ID)
  }

  logOD('orderBookmarks() 22')
  await moveRootBookmarksToUnclassified()
  await moveNotDescriptiveFoldersToUnclassified()

  logOD('orderBookmarks() 33')
  await mergeFolders()

  logOD('orderBookmarks() 44')
  await sortFolders(BOOKMARKS_BAR_FOLDER_ID)
  if (IS_BROWSER_FIREFOX) {
    await sortFolders(BOOKMARKS_MENU_FOLDER_ID)
  }
  await sortFolders(OTHER_BOOKMARKS_FOLDER_ID)

  logOD('orderBookmarks() 55')
  await removeDoubleBookmarks()

  logOD('orderBookmarks() 99')
}
