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
  const bookmarks = await chrome.bookmarks.search({ url });

  if (bookmarks.length > 0) {
    const bookmark = bookmarks[0];
    const parentId = bookmark && bookmark.parentId;
    const resultCount = bookmarks.length;

    if (parentId) {
      const bookmarkFolder = await chrome.bookmarks.get(parentId)

      folderName = resultCount > 1
        ? `${bookmarkFolder[0].title} d${resultCount}`
        : bookmarkFolder[0].title;
    }
  }

  return {
    folderName,
  };
}

export async function getBookmarkInfoUni({ url, useCache=false }) {
  let bookmarkInfo;

  if (useCache) {
    const folderName = cacheUrlToInfo.get(url);
    
    if (folderName !== undefined) {
      bookmarkInfo = { folderName };
      log(' getBookmarkInfoUni: OPTIMIZATION(from cache folderName !== undefined)')
    }
  } 
  
  if (!bookmarkInfo) {
    bookmarkInfo = await getBookmarkInfo(url);
    cacheUrlToInfo.add(url, bookmarkInfo?.folderName || null);
  }

  return bookmarkInfo;
}

export async function updateBookmarkInfoInPage({ tabId, folderName }) {
  try {
    const oldFolderName = cacheTabToInfo.get(tabId);

    if (folderName === oldFolderName) {
      log(' updateBookmarkInfoInPage: OPTIMIZATION(folderName === oldFolderName), not update')
      return;
    }

    await chrome.tabs.sendMessage(tabId, {
      command: "bookmarkInfo",
      folderName,
    });    
    cacheTabToInfo.add(tabId, folderName);
  
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
        folderName: bookmarkInfo?.folderName,
      })
    }
  }
}
