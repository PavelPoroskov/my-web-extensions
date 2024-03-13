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

async function getBookmarkInfo(url) {
  const bookmarkList = await chrome.bookmarks.search({ url });
  if (bookmarkList.length == 0) {
    return [];
  }

  const parentIdList = bookmarkList
    .map((bookmarkItem) => bookmarkItem.parentId)
  const parentFolderList = await chrome.bookmarks.get(parentIdList)

  return bookmarkList
    .map((bookmarkItem, index) => ({
      id: bookmarkItem.id,
      folderName: parentFolderList[index].title,
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
