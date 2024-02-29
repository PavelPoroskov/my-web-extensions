import {
  cacheUrlToInfo,
} from './cache.js'
import {
  promiseQueue,
} from './promiseQueue.js'
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
  if (!url || !isSupportedProtocol(url)) {
    return;
  }

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

async function updateTab00({ tabId, url, useCache=false }) {
  const bookmarkInfo = await getBookmarkInfoUni({ url, useCache });
  log('chrome.tabs.sendMessage(', tabId, bookmarkInfo.folderName);

  return chrome.tabs.sendMessage(tabId, {
    command: "bookmarkInfo",
    folderName: bookmarkInfo.folderName,
    double: bookmarkInfo.double,
  })
}

export async function updateTab({ tabId, url, useCache=false }) {
  if (url && isSupportedProtocol(url)) {
    promiseQueue.add({
      key: `${tabId}#${url}`,
      fn: () => updateTab00({ tabId, url, useCache }),
      isOverwrite: !useCache,
    });
  }
}

export async function updateActiveTab({ useCache=false } = {}) {
  log(' updateActiveTab 00')
  const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  const [Tab] = tabs;

  if (Tab) {
    log('updateActiveTab CALL UPDATETAB');
    updateTab({
      tabId: Tab.id, 
      url: Tab.url, 
      useCache,
    });
  }
}
