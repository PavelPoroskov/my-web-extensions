import {
  log,
  logEvent,
  logSendEvent,
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
} from '../constants.js'

async function updateBookmarksForTabTask({ tabId, url, useCache=false }) {
  log('updateBookmarksForTabTask(', tabId, useCache, url);

  let actualUrl = url

  if (memo.settings[USER_SETTINGS_OPTIONS.CLEAR_URL_FROM_QUERY_PARAMS]) {
    const { cleanUrl } = removeQueryParamsIfTarget(url)

    if (url !== cleanUrl) {
      actualUrl = cleanUrl
    }
  } 

  const bookmarkInfo = await getBookmarkInfoUni({ url: actualUrl, useCache });
  const message = {
    command: "bookmarkInfo",
    bookmarkInfoList: bookmarkInfo.bookmarkInfoList,
    showLayer: memo.settings[USER_SETTINGS_OPTIONS.SHOW_PATH_LAYERS],
  }

  logSendEvent('updateTabTask()', tabId, message);

  return chrome.tabs.sendMessage(tabId, message)
    .then(() => bookmarkInfo);
}
async function updateVisitsForTabTask({ tabId, url, useCache=false }) {
  log('updateVisitsForTabTask(', tabId, useCache, url);

  const visitInfo = await getHistoryInfo({ url, useCache })

  const message = {
    command: "visitInfo",
    showPreviousVisit: memo.settings[USER_SETTINGS_OPTIONS.SHOW_PREVIOUS_VISIT],
    visitList: visitInfo.visitList,
  }
  chrome.tabs.sendMessage(tabId, message)
  
  return chrome.tabs.sendMessage(tabId, message)
    .then(() => visitInfo);
}

export async function updateTab({ tabId, url, useCache=false, debugCaller }) {
  if (url && isSupportedProtocol(url)) {
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
