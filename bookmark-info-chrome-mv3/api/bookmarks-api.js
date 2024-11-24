import {
  memo,
} from './structure/index.js'
import {
  isSupportedProtocol,
} from './common-api.js'
import {
  SOURCE,
} from '../constant/index.js'
import {
  makeLogFunction,
} from '../api/log-api.js'

const logBA = makeLogFunction({ module: 'bookmarks-api' })

// export async function deleteUncleanUrlBookmarkForTab(tabId) {
//   logBA('deleteUncleanUrlBookmarkForTab 00 tabId', tabId)
//   if (!tabId) {
//     return
//   }

//   const tabData = memo.tabMap.get(tabId)
//   logBA('deleteUncleanUrlBookmarkForTab 11 tabData', tabData)

//   if (tabData?.bookmarkId) {
//     logBA('deleteUncleanUrlBookmarkForTab 22')
//     await chrome.bookmarks.remove(tabData.bookmarkId)
//     memo.tabMap.delete(tabId)
//   }
// }

const getParentIdList = (bookmarkList) => {
  const parentIdList = bookmarkList
    .map((bookmarkItem) => bookmarkItem.parentId)
    .filter(Boolean)

  return Array.from(new Set(parentIdList))
}

const getFullPath = (id, bkmFolderById) => {
  const path = [];

  let currentId = id;
  while (currentId) {
    const folder = bkmFolderById.get(currentId);
    path.push(folder.title);
    currentId = folder.parentId;
  }

  return path.filter(Boolean).toReversed()
}

async function addBookmarkParentInfo(bookmarkList, bookmarkByIdMap) {
  // parentIdList.length <= bookmarkList.length
  // for root folders parentIdList=[]
  const parentIdList = getParentIdList(bookmarkList)

  if (parentIdList.length === 0) {
    return
  } 

  const knownParentIdList = [];
  const unknownParentIdList = [];

  parentIdList.forEach((id) => {
    if (bookmarkByIdMap.has(id)) {
      knownParentIdList.push(id)
    } else {
      unknownParentIdList.push(id)
    }
  })

  const knownFolderList = knownParentIdList.map((id) => bookmarkByIdMap.get(id))

  if (unknownParentIdList.length > 0) {
    const unknownFolderList = await chrome.bookmarks.get(unknownParentIdList)

    unknownFolderList.forEach((folder) => {
      bookmarkByIdMap.add(
        folder.id,
        {
          title: folder.title,
          parentId: folder.parentId,
        }
      )
      knownFolderList.push(folder)
    })
  }

  return await addBookmarkParentInfo(knownFolderList, bookmarkByIdMap)
}

async function getBookmarkInfo(url) {
  const bookmarkList = await chrome.bookmarks.search({ url });

  if (bookmarkList.length == 0) {
    return [];
  }

  await addBookmarkParentInfo(bookmarkList, memo.bkmFolderById)

  return bookmarkList
    .map((bookmarkItem) => {
      const fullPathList = getFullPath(bookmarkItem.parentId, memo.bkmFolderById)

      return {
        id: bookmarkItem.id,
        fullPathList,
        title: bookmarkItem.title,
        parentId: bookmarkItem.parentId,
      }
    });
}

export async function getBookmarkInfoUni({ url, useCache=false }) {
  if (!url || !isSupportedProtocol(url)) {
    return;
  }

  let bookmarkInfoList;
  let source;

  if (useCache) {
    bookmarkInfoList = memo.cacheUrlToInfo.get(url);
    
    if (bookmarkInfoList) {
      source = SOURCE.CACHE;
      logBA('getBookmarkInfoUni OPTIMIZATION: from cache bookmarkInfo')
    }
  } 
  
  if (!bookmarkInfoList) {
    bookmarkInfoList = await getBookmarkInfo(url);
    source = SOURCE.ACTUAL;
    memo.cacheUrlToInfo.add(url, bookmarkInfoList);
  }

  return {
    bookmarkInfoList,
    source,
  };
}
