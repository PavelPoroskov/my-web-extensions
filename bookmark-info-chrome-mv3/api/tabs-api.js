import {
  log,
  logEvent,
  logSendEvent,
  logIgnore,
  logDebug
} from './debug.js'
import {
  promiseQueue,
} from './promiseQueue.js'
import {
  isSupportedProtocol,
} from './common-api.js'
import {
  getBookmarkInfoUni,
} from './bookmarks-api.js'
import {
  getHistoryInfo,
} from './history-api.js'
import {
  removeQueryParamsIfTarget,
} from './link-api.js'
import {
  memo,
} from './memo.js'
import {
  USER_SETTINGS_OPTIONS,
  RECENT_TAG_VISIBLE_LIMIT,
} from '../constants.js'

let cleanUrl

export async function cleanUrlIfTarget({ url, tabId }) {
  if (memo.settings[USER_SETTINGS_OPTIONS.CLEAR_URL_FROM_QUERY_PARAMS]) {
    ({ cleanUrl } = removeQueryParamsIfTarget(url));
    
    if (url !== cleanUrl) {
      const msg = {
        command: "changeLocationToCleanUrl",
        cleanUrl,
      }
      logSendEvent('runtimeController.onMessage(contentScriptReady)', tabId, msg)
      await chrome.tabs.sendMessage(tabId, msg)
        .catch((err) => {
          logIgnore('runtimeController.onMessage(contentScriptReady) sendMessage(changeLocationToCleanUrl)', err)
        })

      return cleanUrl
    }
  }
}

async function updateBookmarksForTabTask({ tabId, url, useCache=false }) {
  // logDebug('updateBookmarksForTabTask 00 (', tabId, useCache, url);

  let actualUrl = url

  if (memo.settings[USER_SETTINGS_OPTIONS.CLEAR_URL_FROM_QUERY_PARAMS]) {
    const { cleanUrl } = removeQueryParamsIfTarget(url)

    if (url !== cleanUrl) {
      actualUrl = cleanUrl
    }
  } 

  // logDebug('updateBookmarksForTabTask 11 ');
  const bookmarkInfo = await getBookmarkInfoUni({ url: actualUrl, useCache });
  // const usedParentIdSet = new Set(bookmarkInfo.map(({ parentId }) => parentId))
  const fixedParentIdSet = new Set(memo.fixedTagList.map(({ parentId }) => parentId))
  // const usedOrFixedParentIdSet = usedParentIdSet.union(fixedParentIdSet)

  // logDebug('updateBookmarksForTabTask 22 ');
  // logDebug('memo.fixedTagList Array.isArray', Array.isArray(memo.fixedTagList));
  // logDebug('memo.fixedTagList length', memo.fixedTagList.length);
  // logDebug('memo.recentTagList Array.isArray', Array.isArray(memo.recentTagList));
  // logDebug('memo.recentTagList length', memo.recentTagList.length);
  // logDebug('memo.recentTagList', memo.recentTagList);

  let message = {}
  try {
    // const message = {
    message = {
      command: "bookmarkInfo",
      bookmarkInfoList: bookmarkInfo.bookmarkInfoList,
      showLayer: memo.settings[USER_SETTINGS_OPTIONS.SHOW_PATH_LAYERS],
      isShowTitle: memo.settings[USER_SETTINGS_OPTIONS.SHOW_BOOKMARK_TITLE],
      fixedTagList: memo.fixedTagList
        // .filter(({ parentId }) => !usedParentIdSet.has(parentId))
        .filter(({ title }) => title)
        .sort(({ title: a }, { title: b}) => a.localeCompare(b)),
      recentTagList: memo.recentTagList
        // .filter(({ parentId }) => !usedOrFixedParentIdSet.has(parentId))
        .filter(({ parentId }) => !fixedParentIdSet.has(parentId))
        .filter(({ title }) => title)
        .slice(0, RECENT_TAG_VISIBLE_LIMIT)
        .sort(({ title: a }, { title: b }) => a.localeCompare(b)),
    }
  
  }catch (e) {
    logDebug('updateBookmarksForTabTask got errr', e);
    logDebug('memo.recentTagList', memo.recentTagList);
    throw e
  }

  // logDebug('updateBookmarksForTabTask 33 ');
  // logSendEvent('updateBookmarksForTabTask()', tabId, message);

  await chrome.tabs.sendMessage(tabId, message)
  // logDebug('updateBookmarksForTabTask 44 ');
  
  return bookmarkInfo
}
async function updateVisitsForTabTask({ tabId, url, useCache=false }) {
  log('updateVisitsForTabTask(', tabId, useCache, url);

  const visitInfo = await getHistoryInfo({ url, useCache })

  const message = {
    command: "visitInfo",
    showPreviousVisit: memo.settings[USER_SETTINGS_OPTIONS.SHOW_PREVIOUS_VISIT],
    visitList: visitInfo.visitList,
  }
  logSendEvent('updateVisitsForTabTask()', tabId, message);
  
  return chrome.tabs.sendMessage(tabId, message)
    .then(() => visitInfo);
}

export async function updateTab({ tabId, url, useCache=false, debugCaller }) {
  if (url && isSupportedProtocol(url)) {

    await Promise.all([
      !memo.isProfileStartTimeMSActual && memo.readProfileStartTimeMS(),
      !memo.isSettingsActual && memo.readSettings(),
    ])

    log(`${debugCaller} -> updateTab() useCache`, useCache);
    promiseQueue.add({
      key: `${tabId}-bkm`,
      fn: updateBookmarksForTabTask,
      options: {
        tabId,
        url,
        useCache
      },
    });
    promiseQueue.add({
      key: `${tabId}-visits`,
      fn: updateVisitsForTabTask,
      options: {
        tabId,
        url,
        useCache
      },
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
