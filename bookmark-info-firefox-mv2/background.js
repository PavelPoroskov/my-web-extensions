const CONFIG = {
  SHOW_LOG: false,
}

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

const log = CONFIG.SHOW_LOG ? makeLogWithTimer() : () => { };


class CacheWithLimit {
  constructor ({ name='cache', size = 100 }) {
    this.cache = new Map();
    this.LIMIT = size;
    this.name = name;
  }
  removeStale () {
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

  add (key,value) {
    this.cache.set(key, value);
    log(`   ${this.name}.add: ${key}`, value);
    
    this.removeStale();
  }
  
  get(key) {
    const value = this.cache.get(key);
    log(`   ${this.name}.get: ${key}`, value);
  
    return value;
  }

  delete(key) {
    this.cache.delete(key);
    log(`   ${this.name}.delete: ${key}`);
  }
}

const cacheUrlToInfo = new CacheWithLimit({ name: 'cacheUrlToInfo', size: 150 });

class PromiseQueue {
  constructor () {
    this.cache = new CacheWithLimit({ name: 'cachePromiseQueue', size: 50 });
  }

  add ({ key, fn }) {
    let promiseInQueue = this.cache.get(key);

    const getStepPromise = () => fn()
      .then(() => {
        this.cache.delete(key) 
      })
      .catch((e) => {
        log(' IGNORING error: PromiseQueue', e);

        return { isError: true }
      })

    if (!promiseInQueue) {
      log(' PromiseQueue: create first');
      this.cache.add(
        key,
        getStepPromise()
      )
    } else {
      log(' PromiseQueue: repeat after always');
      this.cache.add(
        key,
        promiseInQueue.finally(() => getStepPromise())
      )
    }
  }
}

const promiseQueue = new PromiseQueue();

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
  log('browser.tabs.sendMessage(', tabId, bookmarkInfo.folderName);

  return browser.tabs.sendMessage(tabId, {
    command: "bookmarkInfo",
    folderName: bookmarkInfo.folderName,
    double: bookmarkInfo.double,
  })
}

async function updateTab({ tabId, url, useCache=false }) {
  if (url && isSupportedProtocol(url)) {
    promiseQueue.add({
      key: `${tabId}`,
      fn: () => updateTab00({ tabId, url, useCache }),
    });
  }
}

async function updateActiveTab({ useCache=false } = {}) {
  log(' updateActiveTab 00')
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
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
    getBookmarkInfoUni({ url, useCache: true });
  },
  async onUpdated(tabId, changeInfo, Tab) {
    log('tabs.onUpdated', Tab.index, tabId, changeInfo);
    switch (true) {
      case (changeInfo?.status == 'loading'): {
        if (changeInfo?.url) {
          log('tabs.onUpdated LOADING', Tab.index, tabId, changeInfo.url);
          getBookmarkInfoUni({ url: changeInfo.url, useCache: true });
        }

        break;
      }
      case (changeInfo?.status == 'complete'): {
        log('tabs.onUpdated COMPLETE', Tab.index, tabId, Tab.url);
        updateTab({
          tabId, 
          url: Tab.url, 
          useCache: true,
        });
    
        break;
      }
    }
  },
  async onActivated({ tabId }) {
    log('tabs.onActivated 00', tabId);
    const Tab = await browser.tabs.get(tabId);
    log('tabs.onActivated 11', Tab.index, tabId, Tab.url);
    
    updateTab({
      tabId, 
      url: Tab.url, 
      useCache: true,
    });
  },
}

const windowsController = {
  onFocusChanged(windowId) {
    if (0 < windowId) {
      log('windows.onFocusChanged', windowId);
      updateActiveTab({ useCache: true });
    }
  },
};

const runtimeController = {
  onStartup() {
    log('runtime.onStartup');
    updateActiveTab({ useCache: true });
  },
  onInstalled () {
    log('runtime.onInstalled');
    updateActiveTab({ useCache: true });
  }
};


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