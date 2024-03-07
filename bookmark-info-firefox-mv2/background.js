const SOURCE = {
  CACHE: 'CACHE',
  ACTUAL: 'ACTUAL',
};
const CONFIG = {
  SHOW_LOG: false,
  SHOW_LOG_EVENT: false,
  SHOW_LOG_CACHE: false,
  SHOW_LOG_QUEUE: false,
  SHOW_LOG_OPTIMIZATION: false,
}
const makeLogWithTime = () => {
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

const logWithTime = makeLogWithTime();

const makeLogWithPrefix = (prefix = '') => {
  return function () {  
    const ar = Array.from(arguments);

    if (prefix) {
      ar.unshift(prefix);
    }

    logWithTime(...ar);
  }
}

const logEvent = CONFIG.SHOW_LOG_EVENT ? makeLogWithPrefix('EVENT') : () => { };
const logOptimization = CONFIG.SHOW_LOG_OPTIMIZATION ? makeLogWithPrefix('OPTIMIZATION') : () => { };
const log = CONFIG.SHOW_LOG ? makeLogWithPrefix() : () => { };
const logPromiseQueue = CONFIG.SHOW_LOG_QUEUE ? logWithTime : () => { };
const logCache = CONFIG.SHOW_LOG_CACHE ? logWithTime : () => { };
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
    logCache(`   ${this.name}.add: ${key}`, value);
    
    this.removeStale();
  }
  
  get(key) {
    const value = this.cache.get(key);
    logCache(`   ${this.name}.get: ${key}`, value);
  
    return value;
  }

  delete(key) {
    this.cache.delete(key);
    logCache(`   ${this.name}.delete: ${key}`);
  }
}

const cacheUrlToInfo = new CacheWithLimit({ name: 'cacheUrlToInfo', size: 150 });
class PromiseQueue {
  constructor () {
    this.promise = {};
    this.tasks = {};
  }

  async continueQueue(key, prevResult) {
    // console.log('this.tasks[key]', this.tasks[key]);
    const task = this.tasks[key]?.shift()

    if (task) {
      const isActual = prevResult?.taskName === task.taskName  
        && prevResult?.url === task.options.url
        && prevResult?.source === SOURCE.ACTUAL;
      logPromiseQueue('task', task);
      logPromiseQueue('prevResult', prevResult);
      logPromiseQueue('isActual', isActual);

      if (!isActual) {
        logPromiseQueue(' PromiseQueue: exec task', key, task.options);
        return task.fn(task.options)
          .catch((er) => {
            logPromiseQueue(' IGNORING error: PromiseQueue', er);
            return this.continueQueue(key);
          })
          .then((result) => (
            this.continueQueue(
              key,
              {
                ...result,
                taskName: task.taskName,
                url: task.options.url,
              }
            )
          ));
      } else {
        logPromiseQueue(' PromiseQueue: exec task, skip : source actual', key, task.options);
        return this.continueQueue(key, prevResult);
      }
    } else {
      logPromiseQueue(' PromiseQueue: finish', key)
      delete this.tasks[key];
      delete this.promise[key];

      return prevResult;
    }
  }

  add ({ key, fn, options }) {
    const taskName = fn.name;

    if (!this.tasks[key]) {
      logPromiseQueue(' PromiseQueue: start', key, options)
      this.tasks[key] = [{ fn, options, taskName }]
      this.promise[key] = this.continueQueue(key);
    } else {
      logPromiseQueue(' PromiseQueue: add task', key, options)
      this.tasks[key].push({ fn, options, taskName })
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
  let id;
  const bookmarks = await browser.bookmarks.search({ url });

  if (bookmarks.length > 0) {
    const bookmark = bookmarks[0];
    const parentId = bookmark && bookmark.parentId;
    double = bookmarks.length;
    id = bookmark?.id;

    if (parentId) {
      const bookmarkFolder = await browser.bookmarks.get(parentId)
      folderName = bookmarkFolder[0].title;
    }
  }

  return {
    folderName,
    double,
    id
  };
}

async function getBookmarkInfoUni({ url, useCache=false }) {
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
  log('browser.tabs.sendMessage(', tabId, bookmarkInfo.folderName);

  return browser.tabs.sendMessage(tabId, {
    command: "bookmarkInfo",
    folderName: bookmarkInfo.folderName,
    double: bookmarkInfo.double,
  })
    .then(() => bookmarkInfo);
}

async function updateTab({ tabId, url, useCache=false, debugCaller }) {
  if (url && isSupportedProtocol(url)) {
    log(`${debugCaller} -> updateTab()`);
    promiseQueue.add({
      key: `${tabId}`,
      fn: updateTabTask,
      options: { tabId, url, useCache },
    });
  }
}

async function updateActiveTab({ useCache=false, debugCaller } = {}) {
  logEvent(' updateActiveTab() 00')
  const tabs = await browser.tabs.query({ active: true, lastFocusedWindow: true });
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
const bookmarksController = {
  async onCreated(_, node) {
    logEvent('bookmark.onCreated');

    // changes in active tab
    await updateActiveTab({
      debugCaller: 'bookmark.onCreated'
    });

    // changes in bookmark manager
    getBookmarkInfoUni({ url: node?.url });
  },
  async onChanged(bookmarkId, changeInfo) {
    logEvent('bookmark.onChanged 00', changeInfo);
    // changes in active tab
    await updateActiveTab({
      debugCaller: 'bookmark.onChanged'
    });

    // changes in bookmark manager
    const [bookmark] = await browser.bookmarks.get(bookmarkId)
    getBookmarkInfoUni({ url: bookmark.url });
  },
  async onMoved(bookmarkId) {
    logEvent('bookmark.onMoved');
    // changes in active tab
    await updateActiveTab({
      debugCaller: 'bookmark.onMoved'
    });

    // changes in bookmark manager
    const [bookmark] = await browser.bookmarks.get(bookmarkId)
    getBookmarkInfoUni({ url: bookmark.url });
  },
  async onRemoved(_, { node }) {
    logEvent('bookmark.onRemoved');
    // changes in active tab
    await updateActiveTab({
      debugCaller: 'bookmark.onRemoved'
    });

    // changes in bookmark manager
    getBookmarkInfoUni({ url: node?.url });
  },
}
const runtimeController = {
  onStartup() {
    logEvent('runtime.onStartup');
    updateActiveTab({
      useCache: true,
      debugCaller: 'runtime.onStartup'
    });
  },
  onInstalled () {
    logEvent('runtime.onInstalled');
    updateActiveTab({
      useCache: true,
      debugCaller: 'runtime.onInstalled'
    });
  }
};
let activeTabId;

const tabsController = {
  onCreated({ pendingUrl: url, index, id }) {
    logEvent('tabs.onCreated', index, id, url);
    getBookmarkInfoUni({ url, useCache: true });
  },
  async onUpdated(tabId, changeInfo, Tab) {
    logEvent('tabs.onUpdated 00', Tab.index, tabId, changeInfo);
    switch (true) {
      case (changeInfo?.status == 'loading'): {
        if (changeInfo?.url) {
          logEvent('tabs.onUpdated 11 LOADING', Tab.index, tabId, changeInfo.url);
          getBookmarkInfoUni({ url: changeInfo.url, useCache: true });
        }

        break;
      }
      case (changeInfo?.status == 'complete'): {
        logEvent('tabs.onUpdated 11 complete tabId activeTabId', tabId, activeTabId);
        
        if (tabId === activeTabId || !activeTabId) {
          logEvent('tabs.onUpdated 22 COMPLETE', Tab.index, tabId, Tab.url);
          updateTab({
            tabId, 
            url: Tab.url, 
            useCache: true,
            debugCaller: 'tabs.onUpdated(complete)'
          });  
        }
    
        break;
      }
    }
  },
  async onActivated({ tabId }) {
    activeTabId = tabId;
    logEvent('tabs.onActivated 00', tabId);
    const Tab = await browser.tabs.get(tabId);
    logEvent('tabs.onActivated 11', Tab.index, tabId, Tab.url);
    
    updateTab({
      tabId, 
      url: Tab.url, 
      useCache: true,
      debugCaller: 'tabs.onActivated(useCache: true)'
    });
    updateTab({
      tabId, 
      url: Tab.url, 
      useCache: false,
      debugCaller: 'tabs.onActivated(useCache: false)'
    });
  },
}
const windowsController = {
  onFocusChanged(windowId) {
    if (0 < windowId) {
      logEvent('windows.onFocusChanged', windowId);
      updateActiveTab({
        useCache: true,
        debugCaller: 'windows.onFocusChanged'
      });
    }
  },
};
logEvent('loading bkm-info-sw.js');

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