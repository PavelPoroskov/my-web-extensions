import {
  log,
  logEvent,
  logSendEvent,
  logDebug,
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
  removeQueryParamsIfTarget,
} from './link-api.js'
import {
  memo,
} from './memo.js'
import {
  USER_SETTINGS_OPTIONS,
  SHOW_PREVIOUS_VISIT_OPTION,
  IS_BROWSER_FIREFOX,
} from '../constants.js'

async function updateTabTask({ tabId, url, useCache=false }) {
  log('updateTabTask(', tabId, useCache, url);

  const actualUrl = memo.settings[USER_SETTINGS_OPTIONS.CLEAR_URL_FROM_QUERY_PARAMS]
    ? removeQueryParamsIfTarget(url)
    : url;

  let bookmarkInfo
  let visitList = []

  switch (memo.settings[USER_SETTINGS_OPTIONS.SHOW_PREVIOUS_VISIT]) {
    case SHOW_PREVIOUS_VISIT_OPTION.ONLY_NO_BKM:
    case SHOW_PREVIOUS_VISIT_OPTION.ALWAYS: {
      ([
        bookmarkInfo,
        visitList,
      ] = await Promise.all([
        getBookmarkInfoUni({ url: actualUrl, useCache }),
        chrome.history.getVisits({ url: actualUrl })
      ]))
      break
    }
    default: {
      bookmarkInfo = await getBookmarkInfoUni({ url: actualUrl, useCache });
    }
  }
  const orderedList = IS_BROWSER_FIREFOX ? visitList : visitList.toReversed();
  const filteredList = [].concat(
    orderedList.slice(0,1),
    orderedList.slice(1).filter(({ transition }) => transition !== 'reload')
  )
  const [currentVisit, previousVisit] = filteredList;

  // logDebug('orderedList', orderedList.map(({ visitTime, transition }) => `${transition} => ${new Date(visitTime).toISOString()}` )) 
  // logDebug('filteredList', filteredList.map(({ visitTime, transition }) => `${transition} => ${new Date(visitTime).toISOString()}` )) 
  // logDebug('updateTabTask url', actualUrl);
  // logDebug('updateTabTask currentVisit', currentVisit?.visitTime, currentVisit?.visitTime && new Date(currentVisit?.visitTime));
  // logDebug('updateTabTask previousVisit', previousVisit?.visitTime, previousVisit?.visitTime && new Date(previousVisit?.visitTime));

  const message = {
    command: "bookmarkInfo",
    bookmarkInfoList: bookmarkInfo.bookmarkInfoList,
    tabId,
    showLayer: memo.settings[USER_SETTINGS_OPTIONS.SHOW_PATH_LAYERS],
    showPreviousVisit: memo.settings[USER_SETTINGS_OPTIONS.SHOW_PREVIOUS_VISIT],
    previousVisitTime: previousVisit?.visitTime,
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
