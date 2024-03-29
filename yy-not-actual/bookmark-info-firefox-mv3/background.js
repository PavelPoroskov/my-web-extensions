const SHOW_LOG = false;

const makeLogWithTimer = () => {
  let startTime;
  let prevLogTime;

  return function () {
    if (!startTime) {
      startTime = Date.now();
      prevLogTime = startTime;
    }

    const newLogTime = Date.now();
    // const dif = (newLogTime - prevLogTime)/1000;
    const dif = (newLogTime - prevLogTime);
    prevLogTime = newLogTime;
  
    const ar = Array.from(arguments);
    ar.unshift(`+${dif}`);
    console.log(...ar);
  }
}

const log = SHOW_LOG ? makeLogWithTimer() : () => { };

class CacheWithLimit {
  constructor ({ name='cache', size = 100 }) {
    this.cache = new Map();
    this.LIMIT = size;
    this.name = name;
  }
  // addToCache = (url,folder) => {
  add (key,value) {
    this.cache.set(key, value);
    log(`   ${this.name}.add: ${key}`, value);
  
    if (this.LIMIT < this.cache.size) {
      let deleteCount = this.cache.size - this.LIMIT;
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
    log(`   ${this.name}.get: ${key}`, value);
  
    return value;
  }

  delete(key) {
    this.cache.delete(key);
  }
}

const cacheUrlToInfo = new CacheWithLimit({ name: 'cacheUrlToInfo', size: 100 });
const cacheTabToInfo = new CacheWithLimit({ name: 'cacheTabToInfo', size: 20 });

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
  let folderName = null;
  let double;
  const bookmarks = await browser.bookmarks.search({ url });

  if (bookmarks.length > 0) {
    const bookmark = bookmarks[0];
    const parentId = bookmark && bookmark.parentId;
    double = bookmarks.length;

    if (parentId) {
      const bookmarkFolder = await browser.bookmarks.get(parentId)
      folderName = bookmarkFolder[0].title;
    }
  }

  return {
    folderName,
    double
  };
}

async function getBookmarkInfoUni({ url, useCache=false }) {
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

async function updateBookmarkInfoInPage({ tabId, bookmarkInfo }) {
  log(' updateBookmarkInfoInPage: 00', tabId)
  try {
    const oldBookmarkInfo = cacheTabToInfo.get(tabId);

    if (bookmarkInfo.folderName === oldBookmarkInfo?.folderName
      && bookmarkInfo.double === oldBookmarkInfo?.double) {
      log(' updateBookmarkInfoInPage: OPTIMIZATION(bookmarkInfo === oldBookmarkInfo), not update')
      return;
    }

    await browser.tabs.sendMessage(tabId, {
      command: "bookmarkInfo",
      folderName: bookmarkInfo.folderName,
      double: bookmarkInfo.double,
    });    
    cacheTabToInfo.add(tabId, bookmarkInfo);
  
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
        bookmarkInfo,
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
  onCreated({ pendingUrl: url, index, id }) {
    log('tabs.onCreated', index, id, url);
    if (url && isSupportedProtocol(url)) {
      getBookmarkInfoUni({ url, useCache: true });
    }
  },
  async onUpdated(tabId, changeInfo, Tab) {
    log('tabs.onUpdated', Tab.index, tabId, changeInfo);
    switch (true) {
      case (changeInfo?.status == 'loading'): {
        cacheTabToInfo.delete(tabId);
        const url = changeInfo?.url;
  
        if (url && isSupportedProtocol(url)) {
          log('tabs.onUpdated LOADING', tabId, url);
          getBookmarkInfoUni({ url, useCache: true });  
        }
        break;
      }
      case (changeInfo?.status == 'complete' && Tab.url && isSupportedProtocol(Tab.url)): {
        const url = Tab.url;
        log('tabs.onUpdated COMPLETE', tabId, url);
        const bookmarkInfo = await getBookmarkInfoUni({ url, useCache: true });
        updateBookmarkInfoInPage({
          tabId,
          bookmarkInfo,
        })
        break;
      }
    }
  },
  async onActivated({ tabId }) {
    log('tabs.onActivated tabId', tabId);
    const Tab = await browser.tabs.get(tabId);
    const url = Tab.url;
    
    if (isSupportedProtocol(url)) {
      const bookmarkInfo = await getBookmarkInfoUni({ url, useCache: true });
      updateBookmarkInfoInPage({
        tabId,
        bookmarkInfo,
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

log('bkm-info-sw.js 00');

browser.bookmarks.onCreated.addListener(bookmarksController.onCreated);
browser.bookmarks.onMoved.addListener(bookmarksController.onMoved);
browser.bookmarks.onChanged.addListener(bookmarksController.onChanged);
browser.bookmarks.onRemoved.addListener(bookmarksController.onRemoved);

browser.tabs.onCreated.addListener(tabsController.onCreated);
browser.tabs.onUpdated.addListener(tabsController.onUpdated);
// listen for tab switching
browser.tabs.onActivated.addListener(tabsController.onActivated);

// listen for window switching
browser.windows.onFocusChanged.addListener(windowsController.onFocusChanged);

browser.runtime.onStartup.addListener(runtimeController.onStartup)
browser.runtime.onInstalled.addListener(runtimeController.onInstalled);
