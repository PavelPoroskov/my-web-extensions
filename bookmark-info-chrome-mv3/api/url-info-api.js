import {
  logOptimization,
} from './debug.js'
import {
  isSupportedProtocol,
} from './common-api.js'
import {
  getBookmarkInfoList,
} from './bookmarks-api.js'
import {
  getPreviousVisitListWhen,
} from './history-api.js'
import {
  SOURCE,
} from '../constants.js'
import {
  memo,
} from './memo.js'

export async function getUrlInfo({ url, useCache=false }) {
    if (!url || !isSupportedProtocol(url)) {
    return;
  }

  let bookmarkInfo;
  let source;

  if (useCache) {
    bookmarkInfo = memo.cacheUrlToInfo.get(url);
    
    if (bookmarkInfo) {
      source = SOURCE.CACHE;
      logOptimization(' getUrlInfo: from cache bookmarkInfo')
    }
  } 
  
  if (!bookmarkInfo) {
    const [
      bookmarkInfoList,
      previousVisitList,
    ] = await Promise.all([
      getBookmarkInfoList(url),
      getPreviousVisitListWhen(url),
    ])
    source = SOURCE.ACTUAL;
    bookmarkInfo = {
      bookmarkInfoList,
      previousVisitList,
    }
    memo.cacheUrlToInfo.add(url, bookmarkInfo);
  }

  return {
    ...bookmarkInfo,
    source,
  };
}
