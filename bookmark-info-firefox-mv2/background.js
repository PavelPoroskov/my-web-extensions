const BROWSER_OPTIONS = {
  CHROME: 'CHROME',
  FIREFOX: 'FIREFOX',
}
const BROWSER_SPECIFIC_OPTIONS = {
  [BROWSER_OPTIONS.CHROME]: {
    MENU_CONTEXT: ['all'],
  },
  [BROWSER_OPTIONS.FIREFOX]: {
    MENU_CONTEXT: ['all','tab'],
  },
}
const BROWSER = BROWSER_OPTIONS.FIREFOX;
const IS_BROWSER_FIREFOX = BROWSER === BROWSER_OPTIONS.FIREFOX;
const BROWSER_SPECIFIC = BROWSER_SPECIFIC_OPTIONS[BROWSER];

const SOURCE = {
  CACHE: 'CACHE',
  ACTUAL: 'ACTUAL',
};

const BASE_ID = 'BKM_INF';

const MENU = {
  CLOSE_DUPLICATE: `${BASE_ID}_CLOSE_DUPLICATE`,
  CLOSE_BOOKMARKED: `${BASE_ID}_CLOSE_BOOKMARKED`,
  // BOOKMARK_AND_CLOSE: `${BASE_ID}_BOOKMARK_AND_CLOSE`,
};

const USER_SETTINGS_OPTIONS = {
  CLEAR_URL_FROM_QUERY_PARAMS: 'CLEAR_URL_FROM_QUERY_PARAMS',
  // MARK_VISITED_URL: 'MARK_VISITED_URL',
}

const o = USER_SETTINGS_OPTIONS
const USER_SETTINGS_DEFAULT_VALUE = {
  [o.CLEAR_URL_FROM_QUERY_PARAMS]: true,
}
const CONFIG = {
  SHOW_LOG_CACHE: false,
  SHOW_LOG_EVENT: false,
  SHOW_LOG_IGNORE: false,
  SHOW_LOG_OPTIMIZATION: false,
  SHOW_LOG_QUEUE: false,
  SHOW_LOG: false,
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

const log = CONFIG.SHOW_LOG ? makeLogWithPrefix() : () => { };
const logCache = CONFIG.SHOW_LOG_CACHE ? logWithTime : () => { };
const logEvent = CONFIG.SHOW_LOG_EVENT ? makeLogWithPrefix('EVENT') : () => { };
const logIgnore = CONFIG.SHOW_LOG_IGNORE ? makeLogWithPrefix('IGNORE') : () => { };
const logOptimization = CONFIG.SHOW_LOG_OPTIMIZATION ? makeLogWithPrefix('OPTIMIZATION') : () => { };
const logPromiseQueue = CONFIG.SHOW_LOG_QUEUE ? logWithTime : () => { };
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
  
  has(key) {
    return this.cache.has(key);
  }

  print() {
    logCache(this.cache);
  }
}
const readSettings = async () => {
  const savedSettings = await browser.storage.local.get(
    Object.values(USER_SETTINGS_OPTIONS)
  );

  return {
    ...USER_SETTINGS_DEFAULT_VALUE,
    ...savedSettings,
  }
}
const memo = {
  activeTabId: '',
  activeTabUrl: '',
  cacheUrlToInfo: new CacheWithLimit({ name: 'cacheUrlToInfo', size: 150 }),
  bkmFolderById: new CacheWithLimit({ name: 'bkmFolderById', size: 200 }),
  settings: USER_SETTINGS_DEFAULT_VALUE,

  async readActualSettings () {
    this.settings = await readSettings();
    log('readActualSettings')
    log(`actual settings: ${Object.entries(this.settings).map(([k,v]) => `${k}: ${v}`).join(', ')}`)
  },
};
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
            logIgnore(' IGNORING error: PromiseQueue', er);
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
async function isHasBookmark(url) {
  const bookmarks = await browser.bookmarks.search({ url });

  return bookmarks.length > 0;
}

async function deleteBookmark(bkmId) {
  await browser.bookmarks.remove(bkmId);
}

const getParentIdList = (bookmarkList) => {
  const parentIdList = bookmarkList
    .map((bookmarkItem) => bookmarkItem.parentId)
    .filter(Boolean)

  return Array.from(new Set(parentIdList))
}

const getFullPath = (id, bkmFolderById) => {
  const path = [];

  let currentId = id;
  while (currentId) {
    const folder = bkmFolderById.get(currentId);
    path.push(folder.title);
    currentId = folder.parentId;
  }

  return path.filter(Boolean).toReversed().join('/ ')
}

async function getBookmarkInfo(url) {
  const bookmarkList = await browser.bookmarks.search({ url });
  if (bookmarkList.length == 0) {
    return [];
  }

  let folderList = bookmarkList;

  while (folderList.length > 0) {
    const parentIdList = getParentIdList(folderList)

    const unknownIdList = [];
    const knownIdList = [];
    parentIdList.forEach((id) => {
      if (memo.bkmFolderById.has(id)) {
        knownIdList.push(id)
      } else {
        unknownIdList.push(id)
      }
    })

    const knownFolderList = knownIdList.map((id) => memo.bkmFolderById.get(id))
    let unknownFolderList = []

    if (unknownIdList.length > 0) {
      unknownFolderList = await browser.bookmarks.get(unknownIdList)
      unknownFolderList.forEach((folder) => {
        memo.bkmFolderById.add(
          folder.id,
          {
            title: folder.title,
            parentId: folder.parentId,
          }
        )
      })
    }

    folderList = knownFolderList.concat(unknownFolderList)
  }

  return bookmarkList
    .map((bookmarkItem) => ({
      id: bookmarkItem.id,
      folderName: memo.bkmFolderById.get(bookmarkItem.parentId).title,
      fullPath: getFullPath(bookmarkItem.parentId, memo.bkmFolderById),
      title: bookmarkItem.title,
    }));
}

async function getBookmarkInfoUni({ url, useCache=false }) {
  if (!url || !isSupportedProtocol(url)) {
    return;
  }

  let bookmarkInfoList;
  let source;

  if (useCache) {
    bookmarkInfoList = memo.cacheUrlToInfo.get(url);
    
    if (bookmarkInfoList) {
      source = SOURCE.CACHE;
      logOptimization(' getBookmarkInfoUni: from cache bookmarkInfo')
    }
  } 
  
  if (!bookmarkInfoList) {
    bookmarkInfoList = await getBookmarkInfo(url);
    source = SOURCE.ACTUAL;
    memo.cacheUrlToInfo.add(url, bookmarkInfoList);
  }

  return {
    bookmarkInfoList,
    source,
  };
}
const exceptionList = [
  'youtube.com',
  'www.youtube.com',
  'youtu.be',
]
const exceptionSet = new Set(exceptionList)

const cleanLink = (link) => {
  try {
    const oLink = new URL(link);
    const { hostname } = oLink;

    if (exceptionSet.has(hostname)) {
      return link
    }

    oLink.search = ''
  
    return oLink.toString();  
  } catch (e) {
    return link
  }
}

let testStr = "https://www.linkedin.com/jobs/view/3920634940/?alternateChannel=search&refId=dvaqme%2FfxHehSAa5o4nVnA%3D%3D&trackingId=8%2FZKaGcTAInuTTH4NyKDoA%3D%3D"
console.log('test cleanLink', cleanLink(testStr))

testStr = "https://www.youtube.com/watch?v=YuJ6SasIS_E&t=356s"
console.log('test cleanLink', cleanLink(testStr))

testStr = "https://youtube.com/watch?v=YuJ6SasIS_E&t=356s"
console.log('test cleanLink', cleanLink(testStr))

testStr = "https://youtu.be/watch?v=YuJ6SasIS_E&t=356s"
console.log('test cleanLink', cleanLink(testStr))
//
// https://career.proxify.io/apply?uuid=566c933b-432e-64e0-b317-dd4390d6a74e&step=AdditionalInformation
async function updateTabTask({ tabId, url, useCache=false }) {
  log('updateTabTask(', tabId, useCache, url);

  const actualUrl = memo.settings[USER_SETTINGS_OPTIONS.CLEAR_URL_FROM_QUERY_PARAMS]
    ? cleanLink(url)
    : url;

  const bookmarkInfo = await getBookmarkInfoUni({ url: actualUrl, useCache });
  log('browser.tabs.sendMessage(', tabId, bookmarkInfo.bookmarkInfoList);

  return browser.tabs.sendMessage(tabId, {
    command: "bookmarkInfo",
    bookmarkInfoList: bookmarkInfo.bookmarkInfoList,
    tabId,
  })
    .then(() => bookmarkInfo);
}

async function updateTab({ tabId, url, useCache=false, debugCaller }) {
  if (url && isSupportedProtocol(url)) {
    log(`${debugCaller} -> updateTab() useCache`, useCache);
    promiseQueue.add({
      key: `${tabId}`,
      fn: updateTabTask,
      options: {
        tabId,
        url,
        useCache
      },
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
async function getDuplicatesTabs(inTabList) {
  const tabList = inTabList.toReversed();
  const duplicateTabIdList = [];
  const uniqUrls = new Map();
  let activeTabId;
  let newActiveTabId;

  // do not change pinned tabs
  tabList
    .filter((Tab) => Tab.pinned)
    .forEach((Tab) => {
      const url = Tab.pendingUrl || Tab.url || '';
      uniqUrls.set(url, Tab.id);
    });

  // priority for active tab
  tabList
    .filter((Tab) => !Tab.pinned && Tab.active)
    .forEach((Tab) => {
      activeTabId = Tab.id;
      const url = Tab.pendingUrl || Tab.url || '';

      if (uniqUrls.has(url)) {
        newActiveTabId = uniqUrls.get(url);
        duplicateTabIdList.push(Tab.id);
      } else {
        uniqUrls.set(url, Tab.id);
      }
    });

  // other tabs
  tabList
    .filter((Tab) => !Tab.pinned && !Tab.active)
    .forEach((Tab) => {
      const url = Tab.pendingUrl || Tab.url || '';

      if (uniqUrls.has(url)) {
        duplicateTabIdList.push(Tab.id);
      } else {
        uniqUrls.set(url, Tab.id);
      }
    });

  return {
    duplicateTabIdList,
    newActiveTabId,
    activeTabId,
  }
}

async function closeDuplicateTabs() {
  const tabs = await browser.tabs.query({ lastFocusedWindow: true });
  const tabsWithId = tabs.filter(({ id }) => id);
  const {
    duplicateTabIdList,
    newActiveTabId,
  } = await getDuplicatesTabs(tabsWithId);

  await Promise.all([
    newActiveTabId && browser.tabs.update(newActiveTabId, { active: true }),
    duplicateTabIdList.length > 0 && browser.tabs.remove(duplicateTabIdList),
  ])
}

async function getTabsWithBookmark(tabList) {
  const tabIdAndUrlList = [];

  tabList
    .filter((Tab) => !Tab.pinned)
    .forEach((Tab) => {
      const url = Tab.pendingUrl || Tab.url;

      if (url) {
        tabIdAndUrlList.push({ tabId: Tab.id, url });
      }
    });

  const uniqUrlList = Array.from(new Set(
    tabIdAndUrlList.map(({ url }) => url)
  ));

  // firefox rejects browser.bookmarks.search({ url: 'about:preferences' })
  const urlHasBookmarkList = (
    await Promise.allSettled(uniqUrlList.map(
      (url) => isHasBookmark(url).then((isHasBkm) => isHasBkm && url)
    ))
  )
    .map(({ value }) => value)
    .filter(Boolean);

  const urlWithBookmarkSet = new Set(urlHasBookmarkList);

  return {
    tabWithBookmarkIdList: tabIdAndUrlList
      .filter(({ url }) => urlWithBookmarkSet.has(url))
      .map(({ tabId }) => tabId),
  }
}

async function closeBookmarkedTabs() {
  const tabs = await browser.tabs.query({ lastFocusedWindow: true });
  const tabsWithId = tabs.filter(({ id }) => id);
  
  const {
    duplicateTabIdList,
    newActiveTabId,
  } = await getDuplicatesTabs(tabsWithId);

  const duplicateIdSet = new Set(duplicateTabIdList);
  const {
    tabWithBookmarkIdList,
  } = await getTabsWithBookmark(
    tabsWithId
      .filter((Tab) => !duplicateIdSet.has(Tab.id))
  );

  const closeTabIdList = duplicateTabIdList.concat(tabWithBookmarkIdList);
  if (closeTabIdList.length === tabs.length) {
    // do not close all tabs. It will close window.
    await browser.tabs.create({ index: 0 });
  }

  await Promise.all([
    newActiveTabId && browser.tabs.update(newActiveTabId, { active: true }),
    closeTabIdList.length > 0 && browser.tabs.remove(closeTabIdList),
  ])
}
const bookmarksController = {
  async onCreated(bookmarkId, node) {
    if (!node.url) {
      return
    }
  
    logEvent('bookmark.onCreated');

    if (memo.settings[USER_SETTINGS_OPTIONS.CLEAR_URL_FROM_QUERY_PARAMS]) {
      const cleanUrl = cleanLink(node.url);
      
      if (node.url !== cleanUrl) {
        await browser.bookmarks.update(
          bookmarkId,
          { url: cleanUrl }
        )
        await browser.tabs.sendMessage(memo.activeTabId, {
          command: "changeLocationToCleanUrl",
          cleanUrl,
        })
      }
    }

    // changes in active tab
    await updateActiveTab({
      debugCaller: 'bookmark.onCreated'
    });

    // changes in bookmark manager
    getBookmarkInfoUni({ url: node.url });
  },
  async onChanged(bookmarkId, changeInfo) {
    logEvent('bookmark.onChanged 00', changeInfo);
    memo.bkmFolderById.delete(bookmarkId);
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
    memo.bkmFolderById.delete(bookmarkId);
    // changes in active tab
    await updateActiveTab({
      debugCaller: 'bookmark.onMoved'
    });

    // changes in bookmark manager
    const [bookmark] = await browser.bookmarks.get(bookmarkId)
    getBookmarkInfoUni({ url: bookmark.url });
  },
  async onRemoved(bookmarkId, { node }) {
    logEvent('bookmark.onRemoved');
    memo.bkmFolderById.delete(bookmarkId);
    // changes in active tab
    await updateActiveTab({
      debugCaller: 'bookmark.onRemoved'
    });

    // changes in bookmark manager
    getBookmarkInfoUni({ url: node?.url });
  },
}
async function createContextMenu() {
  await browser.menus.removeAll();

  browser.menus.create({
    id: MENU.CLOSE_DUPLICATE,
    contexts: BROWSER_SPECIFIC.MENU_CONTEXT,
    title: 'close duplicate tabs',
  });  
  // TODO? bookmark and close all tabs (tabs without bookmarks and tabs with bookmarks)
  //   copy bookmarked tabs
  browser.menus.create({
    id: MENU.CLOSE_BOOKMARKED,
    contexts: BROWSER_SPECIFIC.MENU_CONTEXT,
    title: 'close bookmarked tabs',
  });
  // TODO? bookmark and close tabs (tabs without bookmarks)
}

const runtimeController = {
  onStartup() {
    logEvent('runtime.onStartup');
    memo.readActualSettings()
    // is only firefox use it?
    createContextMenu()
    updateActiveTab({
      useCache: true,
      debugCaller: 'runtime.onStartup'
    });
  },
  onInstalled () {
    logEvent('runtime.onInstalled');
    memo.readActualSettings()
    createContextMenu()
    updateActiveTab({
      useCache: true,
      debugCaller: 'runtime.onInstalled'
    });
  },
  onMessage (message, sender) {
    logEvent('runtime.onMessage message', message);

    switch (message?.command) {
      case "deleteBookmark": {
        logEvent('runtime.onMessage deleteBookmark');
  
        deleteBookmark(message.bkmId);
        break
      }
      case "contentScriptReady": {
        const senderTabId = sender?.tab?.id;
        logEvent('runtime.onMessage contentScriptReady', senderTabId);

        if (senderTabId) {
          updateTab({
            tabId: senderTabId,
            url: message.url,
            useCache: true,
            debugCaller: 'runtime.onMessage contentScriptReady',
          })
        }

        break
      }
      case "optionsChanged": {
        logEvent('runtime.onMessage optionsChanged');
        memo.readActualSettings()

        break
      }
    }
  }
};
const tabsController = {
  onCreated({ pendingUrl: url, index, id }) {
    logEvent('tabs.onCreated', index, id, url);
    getBookmarkInfoUni({
      url,
      useCache: true,
    });
  },
  async onUpdated(tabId, changeInfo, Tab) {
    logEvent('tabs.onUpdated 00', Tab.index, tabId, changeInfo);
    switch (changeInfo?.status) {
      case ('loading'): {
        if (changeInfo?.url) {
          if (tabId === memo.activeTabId) {
            memo.activeTabUrl = changeInfo.url;
          }

          logEvent('tabs.onUpdated 11 LOADING', Tab.index, tabId, changeInfo.url);
          getBookmarkInfoUni({
            url: changeInfo.url,
            useCache: true,
          });
        }

        break;
      }
      case ('complete'): {
        logEvent('tabs.onUpdated 11 complete tabId activeTabId', tabId, memo.activeTabId);
        
        if (tabId === memo.activeTabId || !memo.activeTabId) {
          logEvent('tabs.onUpdated 22 COMPLETE', Tab.index, tabId, Tab.url);
          updateTab({
            tabId, 
            url: Tab.url, 
            useCache: true,
            debugCaller: 'tabs.onUpdated(complete)'
          });

          if (IS_BROWSER_FIREFOX && !memo.activeTabId) {
            const tabs = await browser.tabs.query({ active: true, lastFocusedWindow: true });
            const [Tab] = tabs;

            if (Tab?.id) {
              browser.tabs.update(Tab.id, { active: true })
            }
          }
        }
    
        break;
      }
    }
  },
  async onActivated({ tabId }) {
    memo.activeTabId = tabId;
    logEvent('tabs.onActivated 00', tabId);

    try {
      const Tab = await browser.tabs.get(tabId);
      logEvent('tabs.onActivated 11', Tab.index, tabId, Tab.url);
      memo.activeTabUrl = Tab.url;
      
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
    } catch (er) {
      logIgnore('tabs.onActivated. IGNORING. tab was deleted', er);
    }
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
const contextMenusController = {
  async onClicked (OnClickData) {
    logEvent('contextMenus.onClicked');

    switch (OnClickData.menuItemId) {
      case MENU.CLOSE_DUPLICATE: {
        closeDuplicateTabs();
        break;
      }
      case MENU.CLOSE_BOOKMARKED: {
        closeBookmarkedTabs();
        break;
      }
    }
  }
}
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

browser.menus.onClicked.addListener(contextMenusController.onClicked); 

browser.runtime.onStartup.addListener(runtimeController.onStartup)
browser.runtime.onInstalled.addListener(runtimeController.onInstalled);
browser.runtime.onMessage.addListener(runtimeController.onMessage);