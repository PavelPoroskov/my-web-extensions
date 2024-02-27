import {
  cacheUrlToInfo,
  cacheTabToInfo,
} from './cache.js'
import {
  log,
} from './debug.js'

const supportedProtocols = ["https:", "http:"];

export function isSupportedProtocol(urlString) {
  try {
    const url = new URL(urlString);
    
    return supportedProtocols.includes(url.protocol);
  } catch (_) {
    return false;
  }
}

async function getBookmarkInfo(url) {
  let folderName = null;
  let double;
  const bookmarks = await chrome.bookmarks.search({ url });

  if (bookmarks.length > 0) {
    const bookmark = bookmarks[0];
    const parentId = bookmark && bookmark.parentId;
    double = bookmarks.length;

    if (parentId) {
      const bookmarkFolder = await chrome.bookmarks.get(parentId)
      folderName = bookmarkFolder[0].title;
    }
  }

  return {
    folderName,
    double
  };
}

export async function getBookmarkInfoUni({ url, useCache=false }) {
  let bookmarkInfo;

  if (useCache) {
    bookmarkInfo = cacheUrlToInfo.get(url);
    
    if (bookmarkInfo) {
      log(' getBookmarkInfoUni: OPTIMIZATION(from cache bookmarkInfo)')
    }
  } 
  
  if (!bookmarkInfo) {
    bookmarkInfo = await getBookmarkInfo(url);
    cacheUrlToInfo.add(url, bookmarkInfo);
  }

  return bookmarkInfo;
}

export async function updateBookmarkInfoInPage({ tabId, bookmarkInfo }) {
  log(' updateBookmarkInfoInPage: 00', tabId)
  try {
    const oldBookmarkInfo = cacheTabToInfo.get(tabId);

    if (bookmarkInfo.folderName === oldBookmarkInfo?.folderName
      && bookmarkInfo.double === oldBookmarkInfo?.double) {
      log(' updateBookmarkInfoInPage: OPTIMIZATION(bookmarkInfo === oldBookmarkInfo), not update')
      return;
    }

    // WHY after changing url bookmark label stay for prev page
    // 1) on page with bookmark in folder. Bookmark folder is visible in page
    //    https://medium.com/@irenemmassyy/5-coding-projects-to-make-you-stand-out-during-a-job-interview-d52bb9633c30
    // 2) click on link in page. loaded second page than does not have bookmark
    //    https://medium.com/@irenemmassyy
    //  It is new page with new content. Why prev label is in page?
    // 
    // this code create case above
    if (bookmarkInfo.folderName === null && oldBookmarkInfo?.folderName === undefined) {
      log(' updateBookmarkInfoInPage: OPTIMIZATION(!bookmarkInfo && !oldBookmarkInfo), not update')
      return;
    }

    await chrome.tabs.sendMessage(tabId, {
      command: "bookmarkInfo",
      folderName: bookmarkInfo.folderName,
      double: bookmarkInfo.double,
    });    
    cacheTabToInfo.add(tabId, bookmarkInfo);
  
  } catch (e) {
    log(' IGNORING error: updateBookmarkInfoInPage()', e);
  }
}

export async function updateActiveTab({ useCache=false } = {}) {
  log(' updateActiveTab 00')
  const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  const [Tab] = tabs;

  if (Tab) {
    const url = Tab.url;
    if (isSupportedProtocol(url)) {
      log(' updateActiveTab 11', Tab)
      const bookmarkInfo = await getBookmarkInfoUni({ url, useCache });
      updateBookmarkInfoInPage({
        tabId: Tab.id,
        bookmarkInfo,
      })
    }
  }
}
