import {
  logOptimization,
} from './debug.js'
import {
  cacheUrlToInfo,
} from './cache.js'
import {
  isSupportedProtocol,
} from './common-api.js'
import {
  SOURCE,
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
    // .filter((id) => id !== '0');
}

const getFullPath = (id, folderById) => {
  const path = [];

  let currentId = id;
  while (currentId) {
    path.push(folderById[currentId].title);
    currentId = folderById[currentId].parentId;
  }

  return path.filter(Boolean).toReversed().join('/ ')
}

async function getBookmarkInfo(url) {
  const bookmarkList = await chrome.bookmarks.search({ url });
  if (bookmarkList.length == 0) {
    return [];
  }

  let parentIdList = getParentIdList(bookmarkList);

  const folderById = {};
  while (parentIdList.length > 0) {
    const parentFolderList = await chrome.bookmarks.get(parentIdList)
    parentFolderList.forEach((folder) => {
      folderById[folder.id] = {
        id: folder.id,
        title: folder.title,
        parentId: folder.parentId,
      }
    })
    
    parentIdList = getParentIdList(parentFolderList)
      .filter((id) => !(id in folderById))
  }

  return bookmarkList
    .map((bookmarkItem) => ({
      id: bookmarkItem.id,
      folderName: folderById[bookmarkItem.parentId].title,
      fullPath: getFullPath(bookmarkItem.parentId, folderById),
      title: bookmarkItem.title,
    }));
}

export async function getBookmarkInfoUni({ url, useCache=false }) {
  if (!url || !isSupportedProtocol(url)) {
    return;
  }

  let bookmarkInfoList;
  let source;

  if (useCache) {
    bookmarkInfoList = cacheUrlToInfo.get(url);
    
    if (bookmarkInfoList) {
      source = SOURCE.CACHE;
      logOptimization(' getBookmarkInfoUni: from cache bookmarkInfo')
    }
  } 
  
  if (!bookmarkInfoList) {
    bookmarkInfoList = await getBookmarkInfo(url);
    source = SOURCE.ACTUAL;
    cacheUrlToInfo.add(url, bookmarkInfoList);
  }

  return {
    bookmarkInfoList,
    source,
  };
}
