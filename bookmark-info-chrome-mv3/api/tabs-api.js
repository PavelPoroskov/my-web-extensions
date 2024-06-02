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
  memo,
} from './memo.js'
import {
  USER_SETTINGS_OPTIONS,
  SHOW_PREVIOUS_VISIT_OPTION,
} from '../constants.js'

async function updateTabTask({ tabId, url, useCache=false }) {
  log('updateTabTask(', tabId, useCache, url);

  // const actualUrl = memo.settings[USER_SETTINGS_OPTIONS.CLEAR_URL_FROM_QUERY_PARAMS]
  //   ? removeQueryParamsIfTarget(url)
  //   : url;

  const [
    bookmarkInfo,
    previousVisitList,
  ] = await Promise.all([
    // getBookmarkInfoUni({ url: actualUrl, useCache }),
    // getHistoryInfo({ url: actualUrl, useCache })
    getBookmarkInfoUni({ url, useCache }),
    getHistoryInfo({ url, useCache })
  ])
  const showPreviousVisit = memo.settings[USER_SETTINGS_OPTIONS.SHOW_PREVIOUS_VISIT]

  const message = {
    command: "bookmarkInfo",
    bookmarkInfoList: bookmarkInfo.bookmarkInfoList,
    tabId,
    showLayer: memo.settings[USER_SETTINGS_OPTIONS.SHOW_PATH_LAYERS],
    isShowPreviousVisit: showPreviousVisit === SHOW_PREVIOUS_VISIT_OPTION.ALWAYS
      || showPreviousVisit === SHOW_PREVIOUS_VISIT_OPTION.ONLY_NO_BKM && bookmarkInfo.bookmarkInfoList === 0,
    previousVisitList: previousVisitList,
  }
  logSendEvent('updateTabTask()', tabId, message);

  return chrome.tabs.sendMessage(tabId, message)
    .then(() => bookmarkInfo);
}

export async function updateTab({ tabId, url, useCache=false, debugCaller }) {
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
