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
  let folderName = null;
  let double;
  let id;
  const bookmarks = await chrome.bookmarks.search({ url });

  if (bookmarks.length > 0) {
    const bookmark = bookmarks[0];
    const parentId = bookmark && bookmark.parentId;
    double = bookmarks.length;
    id = bookmark?.id;

    if (parentId) {
      const bookmarkFolder = await chrome.bookmarks.get(parentId)
      folderName = bookmarkFolder[0].title;
    }
  }

  return {
    folderName,
    double,
    id
  };
}

export async function getBookmarkInfoUni({ url, useCache=false }) {
  if (!url || !isSupportedProtocol(url)) {
    return;
  }

  let bookmarkInfo;
  let source;

  if (useCache) {
    bookmarkInfo = cacheUrlToInfo.get(url);
    
    if (bookmarkInfo) {
      source = SOURCE.CACHE;
      logOptimization(' getBookmarkInfoUni: from cache bookmarkInfo')
    }
  } 
  
  if (!bookmarkInfo) {
    bookmarkInfo = await getBookmarkInfo(url);
    source = SOURCE.ACTUAL;
    cacheUrlToInfo.add(url, bookmarkInfo);
  }

  return {
    ...bookmarkInfo,
    source,
  };
}
