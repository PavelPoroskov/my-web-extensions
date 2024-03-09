import {
  log,
  logEvent,
} from './debug.js'
import {
  promiseQueue,
} from './promiseQueue.js'
import {
  isSupportedProtocol,
} from './common-api.js'
import {
  getBookmarkInfoUni,
  isHasBookmark,
} from './bookmarks-api.js'

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

async function getDuplicatesTabs(tabList) {
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

export async function closeDuplicateTabs() {
  const tabs = await chrome.tabs.query({ lastFocusedWindow: true });
  const tabsWithId = tabs.filter(({ id }) => id);
  const {
    duplicateTabIdList,
    newActiveTabId,
  } = await getDuplicatesTabs(tabsWithId);

  await Promise.all([
    newActiveTabId && chrome.tabs.update(newActiveTabId, { active: true }),
    duplicateTabIdList.length > 0 && chrome.tabs.remove(duplicateTabIdList),
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

export async function closeBookmarkedTabs() {
  const tabs = await chrome.tabs.query({ lastFocusedWindow: true });
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

  await Promise.all([
    newActiveTabId && chrome.tabs.update(newActiveTabId, { active: true }),
    closeTabIdList.length > 0 && chrome.tabs.remove(closeTabIdList),
  ])
}
