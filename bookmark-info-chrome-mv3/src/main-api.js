import {
  addToCache,
  getFromCache,
} from './cache.js'
import {
  log,
} from './utils.js'

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
  const bookmarks = await chrome.bookmarks.search({ url });
  const bookmark = bookmarks[0];
  const parentId = bookmark && bookmark.parentId;

  if (parentId) {
    const bookmarkFolder = await chrome.bookmarks.get(parentId)

    return {
      folderName: bookmarkFolder[0].title,
    };
  }
}

export async function getBookmarkInfoUni({ url, useCache=false }) {
  let bookmarkInfo;

  if (useCache) {
    const folderName = getFromCache(url);
    
    if (folderName !== undefined) {
      bookmarkInfo = { folderName };
    }
  } 
  
  if (!bookmarkInfo) {
    bookmarkInfo = await getBookmarkInfo(url);
    addToCache(url, bookmarkInfo?.folderName || null);
  }

  return bookmarkInfo;
}

export function updateBookmarkInfoInPage({ tabId, folderName }) {
  chrome.tabs.sendMessage(tabId, {
    command: "bookmarkInfo",
    folderName,
  });    
}

export async function updateActiveTab({ useCache=false } = {}) {
  log('updateActiveTab 00')
  const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  log('updateActiveTab 11', tabs)
  const [Tab] = tabs;

  if (Tab) {
    const url = Tab.url;
    if (isSupportedProtocol(url)) {
      const bookmarkInfo = await getBookmarkInfoUni({ url, useCache });
      updateBookmarkInfoInPage({
        tabId: Tab.id,
        folderName: bookmarkInfo?.folderName,
      })
    }
  }
}
