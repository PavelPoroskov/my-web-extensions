import {
  debounce,
  extensionSettings,
  isSupportedProtocol,
  makeLogFunction,
} from '../api-low/index.js'
import {
  getBookmarkInfoUni,
  getPartialBookmarkList,
} from './get-bookmarks.api.js'
import {
  isVisitedDatedTitle
} from '../folder-api/index.js'
import {
  getHistoryInfo,
} from './history.api.js'
import {
  USER_OPTION,
  SHOW_VISITED_OPTIONS,
} from '../constant/index.js'
import {
  memo,
  tagList,
} from '../data-structures/index.js'
import {
  showAuthorBookmarks,
} from './showAuthorBookmarks.js'
import { page } from './page.api.js'
import { initExtension } from './init-extension.js'

const logUTB = makeLogFunction({ module: 'updateTab.js' })

async function showVisits({ tabId, url }) {
  const visitInfo = await getHistoryInfo({ url })

  const data = {
    visitString: visitInfo.visitString,
  }
  logUTB('showVisits () 99 sendMessage', tabId, data);
  await page.updateBookmarkInfoInPage({ tabId, data })
}

async function showPartialBookmarks({ tabId, url, exactBkmIdList }) {
  const partialBookmarkList = await getPartialBookmarkList({ url, exactBkmIdList })

  const data = {
    partialBookmarkList,
  }
  logUTB('showPartialBookmarks () 99 sendMessage', tabId, data);
  await page.updateBookmarkInfoInPage({ tabId, data })
}

async function showExtra({ tabId, url, settings, exactBkmIdList }) {
  const isShowVisits = settings[USER_OPTION.SHOW_PREVIOUS_VISIT]
  const isShowPartialBookmarks = settings[USER_OPTION.USE_PARTIAL_URL_SEARCH]
  const isShowAuthorBookmarks = settings[USER_OPTION.URL_SHOW_AUTHOR_TAGS]

  if (isShowVisits) {
    showVisits({ tabId, url })
  }

  if (isShowPartialBookmarks) {
    showPartialBookmarks({ tabId, url, exactBkmIdList })
  }

  if (isShowAuthorBookmarks) {
    showAuthorBookmarks({ tabId, url })
  }
}

async function updateTab({ tabId, url: inUrl, debugCaller, useCache=false }) {
  logUTB(`UPDATE-TAB () 00 <- ${debugCaller}`, tabId);
  let url = inUrl

  if (!url) {
    try {
      const Tab = await chrome.tabs.get(tabId);
      url = Tab?.url
    } catch (er) {
      logUTB('IGNORING. tab was deleted', er);
    }
  }

  if (!(url && isSupportedProtocol(url))) {
    return
  }

  logUTB('UPDATE-TAB () 11', url);

  await initExtension({ debugCaller: 'updateTab ()' })
  const settings = await extensionSettings.get()
  const isShowTitle = settings[USER_OPTION.SHOW_BOOKMARK_TITLE]

  const bookmarkInfo = await getBookmarkInfoUni({ url, useCache, isShowTitle })

  let bookmarkList = bookmarkInfo.bookmarkList
  if (settings[USER_OPTION.SHOW_VISITED] === SHOW_VISITED_OPTIONS.IF_NO_OTHER && 1 < bookmarkList.length) {
    bookmarkList = bookmarkList.filter(({ folder }) => !isVisitedDatedTitle(folder))
  }

  const data = {
    bookmarkList: bookmarkInfo.bookmarkList,
    fontSize: settings[USER_OPTION.FONT_SIZE],
    isShowTitle: settings[USER_OPTION.SHOW_BOOKMARK_TITLE],

    tagList: tagList.list,
    tagListOpenMode: settings[USER_OPTION.TAG_LIST_OPEN_MODE],
    isTagListOpenGlobal: tagList.isOpenGlobal,
    tagLength: settings[USER_OPTION.TAG_LIST_TAG_LENGTH],
    nTagListAvailableRows: tagList.nAvailableRows,
    nFixedTags: tagList.nFixedTags,

    isHideSemanticHtmlTagsOnPrinting: settings[USER_OPTION.HIDE_TAG_HEADER_ON_PRINTING],
    isHideHeaderForYoutube: settings[USER_OPTION.YOUTUBE_HIDE_PAGE_HEADER],
  }
  logUTB('UPDATE-TAB () 99 sendMessage', tabId, data);
  await page.updateBookmarkInfoInPage({ tabId, data })
  showExtra({
    tabId,
    url,
    settings,
    exactBkmIdList: bookmarkInfo.bookmarkList.map(({ id }) => id)
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
  logUTB('debouncedUpdateActiveTab () 00', 'memo[\'activeTabId\']', memo['activeTabId'])

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
