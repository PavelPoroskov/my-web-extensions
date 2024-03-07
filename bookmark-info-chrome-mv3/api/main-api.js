import {
  cacheUrlToInfo,
} from './cache.js'
import {
  promiseQueue,
} from './promiseQueue.js'
import {
  log,
  logOptimization,
  logEvent,
} from './debug.js'
import {
  SOURCE,
} from '../constants.js'

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

async function updateTabTask({ tabId, url, useCache=false }) {
  const bookmarkInfo = await getBookmarkInfoUni({ url, useCache });
  log('chrome.tabs.sendMessage(', tabId, bookmarkInfo.folderName);

  return chrome.tabs.sendMessage(tabId, {
    command: "bookmarkInfo",
    folderName: bookmarkInfo.folderName,
    double: bookmarkInfo.double,
  })
    .then(() => bookmarkInfo);
}

export async function updateTab({ tabId, url, useCache=false, debugCaller }) {
  if (url && isSupportedProtocol(url)) {
    log(`${debugCaller} -> updateTab()`);
    promiseQueue.add({
      key: `${tabId}`,
      fn: updateTabTask,
      options: { tabId, url, useCache },
    });
  }
}

export async function updateActiveTab({ useCache=false, debugCaller } = {}) {
  logEvent(' updateActiveTab() 00')
  const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  const [Tab] = tabs;

  if (Tab) {
    updateTab({
      tabId: Tab.id, 
      url: Tab.url, 
      useCache,
      debugCaller: `${debugCaller} -> updateActiveTab()`
    });
  }
}
