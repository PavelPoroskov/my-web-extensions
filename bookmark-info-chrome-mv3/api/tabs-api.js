import {
  log,
  logEvent,
  logSendEvent,
  logDebug
} from './log-api.js'
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
} from './clean-url-api.js'
import {
  memo,
} from './memo.js'
import {
  CONTENT_SCRIPT_COMMAND_ID,
  USER_SETTINGS_OPTIONS,
} from '../constant/index.js'

async function updateBookmarksForTabTask({ tabId, url, useCache=false }) {
  logDebug('updateBookmarksForTabTask 00 (', tabId, useCache, url);

  let actualUrl = url

  logDebug('updateBookmarksForTabTask 11');
  if (memo.settings[USER_SETTINGS_OPTIONS.CLEAR_URL_FROM_QUERY_PARAMS]) {
    const { cleanUrl } = removeQueryParamsIfTarget(url)

    if (url !== cleanUrl) {
      actualUrl = cleanUrl
    }
  } 
  logDebug('updateBookmarksForTabTask 22');

  const bookmarkInfo = await getBookmarkInfoUni({ url: actualUrl, useCache });
  logDebug('updateBookmarksForTabTask 33');
  const usedParentIdSet = new Set(bookmarkInfo.bookmarkInfoList.map(({ parentId }) => parentId))
  logDebug('updateBookmarksForTabTask 44 memo.tagList', memo.tagList);

  const message = {
    command: CONTENT_SCRIPT_COMMAND_ID.BOOKMARK_INFO,
    bookmarkInfoList: bookmarkInfo.bookmarkInfoList,
    showLayer: memo.settings[USER_SETTINGS_OPTIONS.SHOW_PATH_LAYERS],
    isShowTitle: memo.settings[USER_SETTINGS_OPTIONS.SHOW_BOOKMARK_TITLE],
    tagList: memo.tagList.map(({ parentId, title, isFixed }) => ({
      parentId,
      title, 
      isFixed,
      isUsed: usedParentIdSet.has(parentId)
    }))
  }
  await chrome.tabs.sendMessage(tabId, message)
  
  return bookmarkInfo
}
async function updateVisitsForTabTask({ tabId, url, useCache=false }) {
  log('updateVisitsForTabTask(', tabId, useCache, url);

  const visitInfo = await getHistoryInfo({ url, useCache })

  const message = {
    command: CONTENT_SCRIPT_COMMAND_ID.HISTORY_INFO,
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
