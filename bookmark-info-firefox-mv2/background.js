// import { BkmsController } from './controllers/bkms-controller.js';
// import { TabsController } from './controllers/tabs-controller.js';
// import { WindowsController } from './controllers/windows-controller.js';

// import { updateActiveTab } from './api/main-api.js';
// import { log } from './api/debug.js';

const SHOW_LOG = true;

const log = SHOW_LOG ? console.log : () => { };

class CacheWithLimit {
  constructor ({ name='cache', size = 100 }) {
    this.cache = new Map();
    this.LIMIT = size;
    this.name = name;
  }
  // addToCache = (url,folder) => {
  add (key,value) {
    this.cache.set(key, value);
    log(`   ${this.name}.add:', ${key}, ${value}`);
  
    if (this.LIMIT < this.cache.size) {
      let deleteCount = this.cache.size - CACHE_SIZE_LIMIT;
      const keyToDelete = [];
      
      // Map.key() returns keys in insertion order
      for (const key of this.cache.keys()) {
        keyToDelete.push(key);
        deleteCount -= 1;
        if (deleteCount <= 0) {
          break;
        }
      }
  
      for (const key of keyToDelete) {
        this.cache.delete(key);
      }
    }
  }
  
  get(key) {
    const value = this.cache.get(key);
    log(`   ${this.name}.get:', ${key}, ${value}`);
  
    return value;
  }

  delete(key) {
    this.cache.delete(key);
  }
}

const cacheUrlToInfo = new CacheWithLimit({ name: 'cacheUrlToInfo', size: 100 });
const cacheTabToInfo = new CacheWithLimit({ name: 'cacheTabToInfo', size: 10 });

const supportedProtocols = ["https:", "http:"];

function isSupportedProtocol(urlString) {
  try {
    const url = new URL(urlString);
    
    return supportedProtocols.includes(url.protocol);
  } catch (_) {
    return false;
  }
}

async function getBookmarkInfo(url) {
  const bookmarks = await browser.bookmarks.search({ url });
  const bookmark = bookmarks[0];
  const parentId = bookmark && bookmark.parentId;
  const resultCount = bookmarks.length;

  if (parentId) {
    const bookmarkFolder = await browser.bookmarks.get(parentId)

    const folderName = resultCount > 1
      ? `${bookmarkFolder[0].title} d${resultCount}`
      : bookmarkFolder[0].title;
  
    return {
      folderName,
    };
  }
}

async function getBookmarkInfoUni({ url, useCache=false }) {
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

async function updateBookmarkInfoInPage({ tabId, folderName }) {
  try {
    const oldFolderName = cacheTabToInfo.get(tabId);

    if (folderName === oldFolderName) {
      log(' updateBookmarkInfoInPage: OPTIMIZATION(folderName === oldFolderName), not update')
      return;
    }

    await browser.tabs.sendMessage(tabId, {
      command: "bookmarkInfo",
      folderName,
    });    
    cacheTabToInfo.add(tabId, folderName);
  
  } catch (e) {
    log(' IGNORING error: updateBookmarkInfoInPage()', e);
  }
}

async function updateActiveTab({ useCache=false } = {}) {
  log(' updateActiveTab 00')
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
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

const bookmarksController = {
  onCreated() {
    log('bookmark.onCreated');
    updateActiveTab();
  },
  onChanged() {
    log('bookmark.onChanged');
    updateActiveTab();
  },
  onMoved() {
    log('bookmark.onMoved');
    updateActiveTab();
  },
  onRemoved() {
    log('bookmark.onRemoved');
    updateActiveTab();
  },
}
const tabsController = {
  onCreated({ pendingUrl: url }) {
    log('tabs.onCreated pendingUrl', url);
    if (url && isSupportedProtocol(url)) {
      getBookmarkInfoUni({ url, useCache: true });
    }
  },
  async onUpdated(tabId, changeInfo, Tab) {
    // log('tabs.onUpdated 00', changeInfo);
    switch (true) {
      case (changeInfo?.status == 'loading' && changeInfo?.url && isSupportedProtocol(changeInfo.url)): {
        const url = changeInfo?.url;
        log('tabs.onUpdated11 tabId, status, url', tabId, changeInfo?.status, url);
        cacheTabToInfo.delete(tabId);
        getBookmarkInfoUni({ url, useCache: true });
        break;
      };
      case (changeInfo?.status == 'complete' && Tab.url && isSupportedProtocol(Tab.url)): {
        const url = Tab.url;
        log('tabs.onUpdated22 tabId, status, Tab.url', tabId, changeInfo?.status, url);
        const bookmarkInfo = await getBookmarkInfoUni({ url, useCache: true });
        updateBookmarkInfoInPage({
          tabId,
          folderName: bookmarkInfo?.folderName,
        })
        break;
      };
    }
  },
  async onActivated({ tabId }) {
    log('tabs.onActivated tabId', tabId);
    const Tab = await chrome.tabs.get(tabId);
    const url = Tab.url;
    
    if (isSupportedProtocol(url)) {
      const bookmarkInfo = await getBookmarkInfoUni({ url, useCache: true });
      updateBookmarkInfoInPage({
        tabId,
        folderName: bookmarkInfo?.folderName,
      })
    }
  },
}

const windowsController = {
  onFocusChanged() {
    log('windows.onFocusChanged');
    updateActiveTab({ useCache: true });
  },
};

const runtimeController = {
  onStartup() {
    log('runtime.onStartup');
    updateActiveTab();
  },
  onInstalled () {
    log('runtime.onInstalled');
    updateActiveTab();
  }
};

log('bkm-info-sw.js 00');

chrome.bookmarks.onCreated.addListener(bookmarksController.onCreated);
chrome.bookmarks.onMoved.addListener(bookmarksController.onMoved);
chrome.bookmarks.onChanged.addListener(bookmarksController.onChanged);
chrome.bookmarks.onRemoved.addListener(bookmarksController.onRemoved);

chrome.tabs.onCreated.addListener(tabsController.onCreated);
chrome.tabs.onUpdated.addListener(tabsController.onUpdated);
// listen for tab switching
chrome.tabs.onActivated.addListener(tabsController.onActivated);

// listen for window switching
chrome.windows.onFocusChanged.addListener(windowsController.onFocusChanged);

chrome.runtime.onStartup.addListener(runtimeController.onStartup)
chrome.runtime.onInstalled.addListener(runtimeController.onInstalled);
