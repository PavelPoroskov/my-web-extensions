import {
  debounce,
  isSupportedProtocol,
  makeLogFunction,
} from '../api-low/index.js'
import {
  getBookmarkInfoUni,
} from './get-bookmarks.api.js'
import {
  getHistoryInfo,
} from './history.api.js'
import {
  USER_OPTION,
  INTERNAL_VALUES,
} from '../constant/index.js'
import {
  extensionSettings,
  memo,
  tagList,
} from '../data-structures/index.js'
import { page } from './page.api.js'
import { initExtension } from './init-extension.js'

const logTA = makeLogFunction({ module: 'tabs.api.js' })

async function updateTab({ tabId, url: inUrl, debugCaller, useCache=false }) {
  logTA(`UPDATE-TAB () 00 <- ${debugCaller}`, tabId);
  let url = inUrl

  if (!url) {
    try {
      const Tab = await chrome.tabs.get(tabId);
      url = Tab?.url
    } catch (er) {
      logTA('IGNORING. tab was deleted', er);
    }
  }

  if (!(url && isSupportedProtocol(url))) {
    return
  }

  logTA('UPDATE-TAB () 11', url);

  await initExtension({ debugCaller: 'updateTab ()' })
  const settings = await extensionSettings.get()
  const isShowTitle = settings[USER_OPTION.SHOW_BOOKMARK_TITLE]

  let visitsData
  const isShowVisits = settings[USER_OPTION.SHOW_PREVIOUS_VISIT]

  const [
    bookmarkInfo,
    visitInfo,
  ] = await Promise.all([
    getBookmarkInfoUni({ url, useCache, isShowTitle }),
    isShowVisits && getHistoryInfo({ url }),
  ])
  // logTA(`UPDATE-TAB () 22 bookmarkInfo.bookmarkList`, bookmarkInfo.bookmarkList);

  if (isShowVisits) {
    visitsData = {
      visitString: visitInfo.visitString,
    }
  }

  const data = {
    bookmarkList: bookmarkInfo.bookmarkList,
    isShowTitle: settings[USER_OPTION.SHOW_BOOKMARK_TITLE],
    // visits history
    ...visitsData,
    // recent list
    tagListOpenMode: settings[USER_OPTION.TAG_LIST_OPEN_MODE],
    isTagListOpenGlobal: settings[INTERNAL_VALUES.TAG_LIST_IS_OPEN],
    tagList: tagList.list,
    nTagListAvailableRows: settings[INTERNAL_VALUES.TAG_LIST_AVAILABLE_ROWS],
    nFixedTags: tagList.nFixedTags,

    fontSize: settings[USER_OPTION.FONT_SIZE],
    tagLength: settings[USER_OPTION.TAG_LIST_TAG_LENGTH],
    isHideSemanticHtmlTagsOnPrinting: settings[USER_OPTION.HIDE_TAG_HEADER_ON_PRINTING],
    isHideHeaderForYoutube: settings[USER_OPTION.HIDE_PAGE_HEADER_FOR_YOUTUBE],
  }
  logTA('UPDATE-TAB () 99 sendMessage', tabId, data);
  await page.updateBookmarkInfoInPage({ tabId, data })
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

export async function updateActiveTab({ tabId, url, useCache, debugCaller } = {}) {
  // stop debounced
  debouncedUpdateTab({ isStop: true })

  updateTab({
    tabId,
    url,
    useCache,
    debugCaller: `updateActiveTab () <- ${debugCaller}`,
  })
}
