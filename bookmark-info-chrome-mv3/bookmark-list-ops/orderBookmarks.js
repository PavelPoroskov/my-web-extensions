import {
  BOOKMARKS_BAR_FOLDER_ID,
  BOOKMARKS_MENU_FOLDER_ID,
  OTHER_BOOKMARKS_FOLDER_ID,
  compareDatedTitle,
} from '../folder-api/index.js'
import {
  datedTemplate,
} from '../bookmark-controller-api/index.js'
import {
  moveFolders,
} from './moveFolders.js'
import {
  mergeSubFoldersLevelOneAndTwo,
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
  makeLogFunction,
} from '../api-low/index.js';

const logOD = makeLogFunction({ module: 'orderBookmarks.js' })

export async function orderBookmarks() {
  logOD('orderBookmarks() 00')

  logOD('orderBookmarks() 11')
  await moveFolders()
  logOD('orderBookmarks() 11.2')
  await moveOldDatedFolders()

  logOD('orderBookmarks() 22')
  await moveRootBookmarksToUnclassified()
  await moveNotDescriptiveFoldersToUnclassified()

  logOD('orderBookmarks() 33')
  await mergeSubFoldersLevelOneAndTwo(BOOKMARKS_BAR_FOLDER_ID)
  await mergeSubFoldersLevelOneAndTwo(BOOKMARKS_MENU_FOLDER_ID)
  await mergeSubFoldersLevelOneAndTwo(OTHER_BOOKMARKS_FOLDER_ID)

  logOD('orderBookmarks() 44')
  await sortFolders({ parentId: BOOKMARKS_BAR_FOLDER_ID })
  await sortFolders({ parentId: BOOKMARKS_MENU_FOLDER_ID })
  await sortFolders({ parentId: OTHER_BOOKMARKS_FOLDER_ID })

  const datedRootNewId = datedTemplate.findDatedRootNew()
  const datedRootOldId = datedTemplate.findDatedRootOld()
  await sortFolders({ parentId: datedRootNewId, compare: compareDatedTitle })
  await sortFolders({ parentId: datedRootOldId, compare: compareDatedTitle })

  logOD('orderBookmarks() 55')
  await removeDoubleBookmarks()

  logOD('orderBookmarks() 99')
}
