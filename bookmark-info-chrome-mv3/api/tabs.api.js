import {
  makeLogFunction,
} from '../api/log.api.js'
import {
  debounce,
  isSupportedProtocol,
} from './common.api.js'
import {
  getBookmarkInfoUni,
} from './bookmarks.api.js'
import {
  getHistoryInfo,
} from './history.api.js'
import {
  USER_OPTION,
  INTERNAL_VALUES,
} from './storage.api.config.js'
import {
  extensionSettings,
  memo,
  tagList,
} from './structure/index.js'
import {
  CONTENT_SCRIPT_MSG_ID,
} from '../constant/index.js'
import { initExtension } from './init-extension.js'

const logTA = makeLogFunction({ module: 'tabs.api' })

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

  let visitsData
  const isShowVisits = settings[USER_OPTION.SHOW_PREVIOUS_VISIT]

  const [
    bookmarkInfo,
    visitInfo,
  ] = await Promise.all([
    getBookmarkInfoUni({ url, useCache }),
    isShowVisits && getHistoryInfo({ url }),
  ])
  logTA(`updateTab () 11 bookmarkInfo.bookmarkInfoList`, bookmarkInfo.bookmarkInfoList);

  if (isShowVisits) {
    visitsData = {
      visitString: visitInfo.visitString,
    }  
  }

  const message = {
    command: CONTENT_SCRIPT_MSG_ID.BOOKMARK_INFO,
    bookmarkInfoList: bookmarkInfo.bookmarkInfoList,
    isShowTitle: settings[USER_OPTION.SHOW_BOOKMARK_TITLE],
    // visits history
    ...visitsData,
    // recent list
    tagList: tagList.list,
    isShowTagList: settings[INTERNAL_VALUES.TAG_LIST_IS_OPEN],
    tagLength: settings[USER_OPTION.TAG_LIST_TAG_LENGTH],
    // page settings
    isHideSemanticHtmlTagsOnPrinting: settings[USER_OPTION.HIDE_TAG_HEADER_ON_PRINTING],
    isHideHeaderForYoutube: settings[USER_OPTION.HIDE_PAGE_HEADER_FOR_YOUTUBE],
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
