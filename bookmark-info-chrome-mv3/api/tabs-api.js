import {
  log,
  logSendEvent,
} from './log-api.js'
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
  extensionSettings,
  memo,
  debounceQueue,
  tagList,
} from './structure/index.js'
import {
  CONTENT_SCRIPT_COMMAND_ID,
  STORAGE_KEY,
} from '../constant/index.js'
import { initExtension } from './init-extension.js'

async function updateTabTask({ tabId, url, useCache=false }) {
  log(' updateTabTask() 00', tabId, url, useCache)
  await initExtension()
  const settings = await extensionSettings.get()

  let actualUrl = url

  if (settings[STORAGE_KEY.CLEAR_URL]) {
    const { cleanUrl } = removeQueryParamsIfTarget(url)

    if (url !== cleanUrl) {
      actualUrl = cleanUrl
    }
  } 

  let visitsData
  const isShowVisits = settings[STORAGE_KEY.SHOW_PREVIOUS_VISIT]

  const [
    bookmarkInfo,
    visitInfo,
  ] = await Promise.all([
    getBookmarkInfoUni({ url: actualUrl, useCache }),
    isShowVisits && getHistoryInfo({ url: actualUrl, useCache }),
  ])

  if (isShowVisits) {
    visitsData = {
      visitList: visitInfo.visitList,
    }  
  }

  const message = {
    command: CONTENT_SCRIPT_COMMAND_ID.BOOKMARK_INFO,
    bookmarkInfoList: bookmarkInfo.bookmarkInfoList,
    showLayer: settings[STORAGE_KEY.SHOW_PATH_LAYERS],
    isShowTitle: settings[STORAGE_KEY.SHOW_BOOKMARK_TITLE],
    // visits history
    ...visitsData,
    // recent list
    tagList: tagList.list,
    isShowTagList: settings[STORAGE_KEY.ADD_BOOKMARK_LIST_SHOW],
    tagLength: settings[STORAGE_KEY.ADD_BOOKMARK_TAG_LENGTH],
    // page settings
    isHideSemanticHtmlTagsOnPrinting: settings[STORAGE_KEY.HIDE_TAG_HEADER_ON_PRINTING],
  }
  logSendEvent('updateTabTask()', tabId, message);
  await chrome.tabs.sendMessage(tabId, message)
    // eslint-disable-next-line no-unused-vars
    .catch((er) => {
      // console.log('Failed to send bookmarkInfoTo to tab', tabId, ' Ignoring ', er)
    })
}

export async function updateTab({ tabId, url, useCache=false, debugCaller }) {
  
  if (url && isSupportedProtocol(url)) {
  
    log(`${debugCaller} -> updateTab() useCache`, useCache);
    debounceQueue.run({
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
  log(' updateActiveTab() 00')

  if (!memo.activeTabId) {
    const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    const [Tab] = tabs;

    if (Tab) {
      memo.activeTabId = Tab.id
      memo.activeTabUrl = Tab.url
      memo.isChromeBookmarkManagerTabActive = (Tab.url && Tab.url.startsWith('chrome://bookmarks'));
    }
  }

  if (memo.activeTabId && memo.activeTabUrl) {   
    updateTab({
      tabId: memo.activeTabId, 
      url: memo.activeTabUrl, 
      useCache,
      debugCaller: `${debugCaller} -> updateActiveTab()`
    });
  }
}
