import {
  compareDatedTitle,
  getDateFromDatedTitle,
  getTitleDetails,
  isDatedFolderTitle,
  isDatedServiceTitle,
  isTitleHasDirectives,
} from '../folder-api/index.js'
import {
  folderCreator,
  rootFolders,
} from '../folder-creator-api/index.js'
import {
  copyChildFolders,
  flatChildFolders,
  moveChildFolders,
} from './moveFolders.js'
import {
  mergeChildFolders,
} from './mergeFolders.js'
import {
  moveNotDescriptiveFoldersToUnclassified,
} from './moveNotDescriptiveFolders.js'
import {
  moveRootBookmarksToUnclassified,
} from './moveRootBookmarks.js'
import {
  removeDoubleBookmarks,
} from './removeDoubleBookmarks.js'
import {
  removeDoubleDatedBookmarks,
} from './removeDoubleDatedBookmarks.js'
import {
  sortFolders,
} from './sortFolders.js'
import {
  isTopFolder,
} from './folder-directives.js'
// import {
//   updateBookmarks,
// } from './updateBookmarks.js'
import {
  makeLogFunction,
} from '../api-low/index.js';

const logOD = makeLogFunction({ module: 'orderBookmarks.js' })

export async function orderBookmarks() {
  logOD('orderBookmarks() 00')

  // function getUpdateForBookmark({ url, title }) {
  //   try {
  //     const oUrl = new URL(url)

  //     if (oUrl.hostname == 'frontendmasters.com') {
  //       if (oUrl.pathname.startsWith('/blog/')) {
  //         oUrl.pathname = oUrl.pathname.slice(5)
  //         oUrl.hostname = 'blog.master.dev'
  //       } else {
  //         oUrl.hostname = 'master.dev'
  //       }

  //       return {
  //         url: oUrl.toString(),
  //         title: title.replace('Frontend Masters', 'Master.dev')
  //       }
  //     }


  //     if ((oUrl.hostname == 'master.dev' || oUrl.hostname == 'blog.master.dev') && title.includes('Frontend Masters')) {
  //       return {
  //         title: title.replace('Frontend Masters', 'Master.dev')
  //       }
  //     }

  //   // eslint-disable-next-line no-empty
  //   } finally {

  //   }
  // }
  // await updateBookmarks({ getUpdateForBookmark })

  logOD('orderBookmarks() before flatChildFolders')
  await flatChildFolders({ folderId: rootFolders.BOOKMARKS_BAR_FOLDER_ID })
  // await flatChildFolders({ folderId: rootFolders.BOOKMARKS_MENU_FOLDER_ID })

  const datedRootNewId = await folderCreator.findDatedRootNew()
  const datedRootOldId = await folderCreator.findDatedRootOld()
  const datedRootServiceId = await folderCreator.findDatedRootService()
  const correctDatedRootSet = new Set([datedRootNewId, datedRootOldId, datedRootServiceId].filter(Boolean))

  await flatChildFolders({
    folderId: rootFolders.OTHER_BOOKMARKS_FOLDER_ID,
    isMoving: (folder) => !(correctDatedRootSet(folder.parentId) && isDatedFolderTitle(folder.title)),
  })

  logOD('orderBookmarks() 11')

  async function isMovingFolderFromBkmBarToOthers({ title }) {
    if (isTitleHasDirectives(title)) {
      return true
    }

    const isTopFolderCondition = await isTopFolder(title)
    if (!isTopFolderCondition) {
      return true
    }

    return false
  }
  logOD('orderBookmarks() before moveChildFolders BAR -> Others')
  await moveChildFolders({
    fromId: rootFolders.BOOKMARKS_BAR_FOLDER_ID,
    toId: rootFolders.OTHER_BOOKMARKS_FOLDER_ID,
    isMovingFolder: isMovingFolderFromBkmBarToOthers,
  })
  // await moveChildFolders({
  //   fromId: rootFolders.BOOKMARKS_MENU_FOLDER_ID,
  //   toId: rootFolders.OTHER_BOOKMARKS_FOLDER_ID,
  // })

  logOD('orderBookmarks() before top folders BAR -> Others')
  // sync top folders: to others
  await copyChildFolders({
    fromId: rootFolders.BOOKMARKS_BAR_FOLDER_ID,
    toId: rootFolders.OTHER_BOOKMARKS_FOLDER_ID,
    getNewFolderTitle: ({ title }) => `${title} #top`,
  })
  // sync top folders: to top
  function isCopingTopFolderFromOthersToBkmBar({ title }) {
    return (title.endsWith(' #top') || title.includes(' #top '))
  }
  logOD('orderBookmarks() before top folders Others -> BAR')
  await copyChildFolders({
    fromId: rootFolders.OTHER_BOOKMARKS_FOLDER_ID,
    toId: rootFolders.BOOKMARKS_BAR_FOLDER_ID,
    // TODO with directive #top
    isMovingFolder: isCopingTopFolderFromOthersToBkmBar,
    getNewFolderTitle: ({ title }) => getTitleDetails(title).onlyTitle
  })

  logOD('orderBookmarks() 11.2')

  // move dated from root to dated new
  await moveChildFolders({
    fromId: rootFolders.OTHER_BOOKMARKS_FOLDER_ID,
    isMovingFolder: ({ title }) => isDatedFolderTitle(title) && !isDatedServiceTitle(title),
    createToId: () => folderCreator.findOrCreateDatedRootNew(),
  })

  // move dated from root to dated service
  await moveChildFolders({
    fromId: rootFolders.OTHER_BOOKMARKS_FOLDER_ID,
    isMovingFolder: ({ title }) => isDatedFolderTitle(title) && isDatedServiceTitle(title),
    createToId: () => folderCreator.findDatedRootService(),
  })

  // move old dated folders
  const KEEP_DATED_FOLDERS = 5

  function filterDatedFolders(folderList) {
    const folderListWithDate = folderList
      .map(({ title, id }) => ({
        id,
        title,
        date: getDateFromDatedTitle(title),
      }))

    const groupedObj = Object.groupBy(folderListWithDate, ({ date }) => date)

    const filteredList = Object.entries(groupedObj)
      .sort(([dateA],[dateB]) => -dateA.localeCompare(dateB))
      .slice(KEEP_DATED_FOLDERS)
      .map(([,list]) => list)
      .flat()

    return filteredList
  }
  await moveChildFolders({
    fromId: datedRootNewId,
    isMovingFolder: ({ title }) => isDatedFolderTitle(title),
    filterList: filterDatedFolders,
    createToId: () => folderCreator.findOrCreateDatedRootOld(),
  })

  logOD('orderBookmarks() 22')
  await moveRootBookmarksToUnclassified({
    fromId: rootFolders.BOOKMARKS_BAR_FOLDER_ID,
    createToId: () => folderCreator.findOrCreateUnclassified(),
  })
  await moveRootBookmarksToUnclassified({
    fromId: rootFolders.OTHER_BOOKMARKS_FOLDER_ID,
    createToId: () => folderCreator.findOrCreateUnclassified(),
  })

  await moveNotDescriptiveFoldersToUnclassified({
    fromId: rootFolders.BOOKMARKS_BAR_FOLDER_ID,
    createToId: () => folderCreator.findOrCreateUnclassified(),
  })
  await moveNotDescriptiveFoldersToUnclassified({
    fromId: rootFolders.OTHER_BOOKMARKS_FOLDER_ID,
    createToId: () => folderCreator.findOrCreateUnclassified(),
  })

  logOD('orderBookmarks() 33')

  await mergeChildFolders({ parentId: rootFolders.BOOKMARKS_BAR_FOLDER_ID })
  await mergeChildFolders({ parentId: rootFolders.OTHER_BOOKMARKS_FOLDER_ID })
  // await mergeChildFolders({ parentId: rootFolders.BOOKMARKS_MENU_FOLDER_ID })
  await mergeChildFolders({ parentId: datedRootNewId })
  await mergeChildFolders({ parentId: datedRootOldId })

  logOD('orderBookmarks() 44')
  await sortFolders({ parentId: rootFolders.BOOKMARKS_BAR_FOLDER_ID })
  await sortFolders({ parentId: rootFolders.OTHER_BOOKMARKS_FOLDER_ID })
  // await sortFolders({ parentId: rootFolders.BOOKMARKS_MENU_FOLDER_ID })
  await sortFolders({ parentId: datedRootNewId, compare: compareDatedTitle })
  await sortFolders({ parentId: datedRootOldId, compare: compareDatedTitle })

  logOD('orderBookmarks() 55')
  await removeDoubleBookmarks()
  await removeDoubleDatedBookmarks({ parentId: datedRootNewId })
  await removeDoubleDatedBookmarks({ parentId: datedRootOldId })

  logOD('orderBookmarks() 99')
}
