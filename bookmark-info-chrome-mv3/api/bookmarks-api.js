import {
  log,
  logOptimization,
} from './debug.js'
import {
  memo,
} from './memo.js'
import {
  isSupportedProtocol,
} from './common-api.js'
import {
  SOURCE,
  USER_SETTINGS_OPTIONS,
} from '../constants.js'

export async function isHasBookmark(url) {
  const bookmarks = await chrome.bookmarks.search({ url });

  return bookmarks.length > 0;
}

export async function deleteBookmark(bkmId) {
  await chrome.bookmarks.remove(bkmId);
}

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

async function getBookmarkInfo(url) {
  const bookmarkList = await chrome.bookmarks.search({ url });
  if (bookmarkList.length == 0) {
    return [];
  }

  let folderList = bookmarkList;

  while (folderList.length > 0) {
    const parentIdList = getParentIdList(folderList)

    const unknownIdList = [];
    const knownIdList = [];
    parentIdList.forEach((id) => {
      if (memo.bkmFolderById.has(id)) {
        knownIdList.push(id)
      } else {
        unknownIdList.push(id)
      }
    })

    const knownFolderList = knownIdList.map((id) => memo.bkmFolderById.get(id))
    let unknownFolderList = []

    if (unknownIdList.length > 0) {
      unknownFolderList = await chrome.bookmarks.get(unknownIdList)
      unknownFolderList.forEach((folder) => {
        memo.bkmFolderById.add(
          folder.id,
          {
            title: folder.title,
            parentId: folder.parentId,
          }
        )
      })
    }

    folderList = knownFolderList.concat(unknownFolderList)
  }

  const showLayer = memo.settings[USER_SETTINGS_OPTIONS.SHOW_PATH_LAYERS];

  return bookmarkList
    .map((bookmarkItem) => {
      const fullPathList = getFullPath(bookmarkItem.parentId, memo.bkmFolderById)
      const shortPathList = fullPathList.slice(-showLayer)
      const restPathList = fullPathList.slice(0, -showLayer)

      return {
        id: bookmarkItem.id,
        shortPath: shortPathList.join('/ '),
        restPath: restPathList.concat('').join('/ '),
        title: bookmarkItem.title,
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
      logOptimization(' getBookmarkInfoUni: from cache bookmarkInfo')
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
