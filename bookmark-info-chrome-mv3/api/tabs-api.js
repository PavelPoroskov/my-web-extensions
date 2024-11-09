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

async function updateBookmarksForTabTask({ tabId, url, useCache=false }) {
  log(' updateBookmarksForTabTask() 00', tabId, url, useCache)
  const settings = await extensionSettings.get()
  let actualUrl = url

  if (settings[STORAGE_KEY.CLEAR_URL]) {
    const { cleanUrl } = removeQueryParamsIfTarget(url)

    if (url !== cleanUrl) {
      actualUrl = cleanUrl
    }
  } 

  const bookmarkInfo = await getBookmarkInfoUni({ url: actualUrl, useCache });

  const message = {
    command: CONTENT_SCRIPT_COMMAND_ID.BOOKMARK_INFO,
    bookmarkInfoList: bookmarkInfo.bookmarkInfoList,
    showLayer: settings[STORAGE_KEY.SHOW_PATH_LAYERS],
    isShowTitle: settings[STORAGE_KEY.SHOW_BOOKMARK_TITLE],
  }
  logSendEvent('updateBookmarksForTabTask()', tabId, message);
  await chrome.tabs.sendMessage(tabId, message)
}
async function updateTagsForTab({ tabId }) {
  const settings = await extensionSettings.get()

  const message = {
    command: CONTENT_SCRIPT_COMMAND_ID.TAGS_INFO,
    tagList: tagList.list,
    isShowTagList: settings[STORAGE_KEY.ADD_BOOKMARK_LIST_SHOW],
    tagLength: settings[STORAGE_KEY.ADD_BOOKMARK_TAG_LENGTH],
    isHideSemanticHtmlTagsOnPrinting: settings[STORAGE_KEY.HIDE_TAG_HEADER_ON_PRINTING],
  }
  logSendEvent('updateTagsForTabTask()', tabId, message);
  await chrome.tabs.sendMessage(tabId, message)
    // eslint-disable-next-line no-unused-vars
    .catch((er) => {
      // console.log('Failed to send tagInfo to tab', tabId, ' Ignoring ', er)
    })
}
async function updateVisitsForTabTask({ tabId, url, useCache=false }) {
  log('updateVisitsForTabTask(', tabId, useCache, url);

  const visitInfo = await getHistoryInfo({ url, useCache })

  const message = {
    command: CONTENT_SCRIPT_COMMAND_ID.HISTORY_INFO,
    visitList: visitInfo.visitList,
  }
  logSendEvent('updateVisitsForTabTask()', tabId, message);
  
  return chrome.tabs.sendMessage(tabId, message)
}

export async function updateTab({ tabId, url, useCache=false, debugCaller }) {
  if (url && isSupportedProtocol(url)) {

    await initExtension()
    const settings = await extensionSettings.get()

    log(`${debugCaller} -> updateTab() useCache`, useCache);
    debounceQueue.run({
      key: `${tabId}`,
      fn: updateBookmarksForTabTask,
      options: {
        tabId,
        url,
        useCache
      },
    });

    if (settings[STORAGE_KEY.SHOW_PREVIOUS_VISIT]) {
      updateVisitsForTabTask({
        tabId,
        url,
        useCache
      })
    }

    await updateTagsForTab({ tabId });
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
      memo.isActiveTabBookmarkManager = (Tab.url && Tab.url.startsWith('chrome://bookmarks'));
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
