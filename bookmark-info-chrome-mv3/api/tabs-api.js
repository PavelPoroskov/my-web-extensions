import {
  makeLogFunction,
} from '../api/log-api.js'
import {
  debounce,
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
  tagList,
} from './structure/index.js'
import {
  CONTENT_SCRIPT_COMMAND_ID,
  STORAGE_KEY,
} from '../constant/index.js'
import { initExtension } from './init-extension.js'

const logTA = makeLogFunction({ module: 'tabs-api' })

async function updateTab({ tabId, debugCaller, useCache=false }) {
  let url

  try {
    const Tab = await chrome.tabs.get(tabId);
    url = Tab?.url
  } catch (er) {
    logTA('IGNORING. tab was deleted', er);
  }

  if (!(url && isSupportedProtocol(url))) {
    return
  }

  logTA(`updateTab () 00 <- ${debugCaller}`, tabId, url);

  await initExtension({ debugCaller: 'updateTab ()' })
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
    isShowVisits && getHistoryInfo({ url: actualUrl }),
  ])

  if (isShowVisits) {
    visitsData = {
      visitList: visitInfo.visitList,
    }  
  }

  const message = {
    command: CONTENT_SCRIPT_COMMAND_ID.BOOKMARK_INFO,
    bookmarkInfoList: bookmarkInfo.bookmarkInfoList,
    isShowTitle: settings[STORAGE_KEY.SHOW_BOOKMARK_TITLE],
    // visits history
    ...visitsData,
    // recent list
    tagList: tagList.list,
    isShowTagList: settings[STORAGE_KEY.ADD_BOOKMARK_LIST_SHOW],
    tagLength: settings[STORAGE_KEY.ADD_BOOKMARK_TAG_LENGTH],
    // page settings
    isHideSemanticHtmlTagsOnPrinting: settings[STORAGE_KEY.HIDE_TAG_HEADER_ON_PRINTING],
    isHideHeaderForYoutube: settings[STORAGE_KEY.HIDE_PAGE_HEADER_FOR_YOUTUBE],
  }
  logTA('updateTab () sendMessage', tabId, message);
  await chrome.tabs.sendMessage(tabId, message)
    // eslint-disable-next-line no-unused-vars
    .catch((er) => {
      // logTA('Failed to send bookmarkInfoTo to tab', tabId, ' Ignoring ', er)
    })
}

function updateTabTask(options) {
  if (options?.isStop) {
    return
  }

  updateTab(options)
}

const debouncedUpdateTab = debounce(updateTabTask, 30)

export function debouncedUpdateActiveTab({ debugCaller } = {}) {
  logTA('debouncedUpdateActiveTab () 00', 'memo[\'activeTabId\']', memo['activeTabId'])

  if (memo.activeTabId) {
    debouncedUpdateTab({
      tabId: memo.activeTabId,
      debugCaller: `debouncedUpdateActiveTab () <- ${debugCaller}`,
    })
  }
}

export async function updateActiveTab({ debugCaller, useCache } = {}) {
  // stop debounced
  debouncedUpdateTab({ isStop: true })

  if (memo.activeTabId) {
    updateTab({
      tabId: memo.activeTabId,
      useCache,
      debugCaller: `updateActiveTab () <- ${debugCaller}`,
    })
  }
}
