import {
  extensionSettings,
  page,
  tagList,
} from '../api-mid/index.js'
import {
  debounce_leading3,
  makeLogFunction,
} from '../api-low/index.js'
import {
  isSupportedProtocol,
} from '../url-api/index.js'
import {
  isVisitedDatedTitle,
  isVisitedDatedTemplate,
} from '../folder-api/index.js'
import {
  getHistoryInfo,
} from './history.api.js'
import {
  USER_OPTION,
  SHOW_VISITED_OPTIONS,
} from '../constant/index.js'
import {
  showAuthorBookmarks,
} from './showAuthorBookmarks.js'
import {
  getBookmarkListWithTemplate,
  getPartialBookmarkList,
} from '../bookmark-list-api/index.js';
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
  const bookmarkList = await getPartialBookmarkList({ url, exactBkmIdList })
  const filteredList = bookmarkList.filter(({ parentTitle }) => !isVisitedDatedTitle(parentTitle))

  const data = {
    partialBookmarkList: filteredList,
  }
  logUTB('showPartialBookmarks () 99 sendMessage', tabId, data);
  await page.updateBookmarkInfoInPage({ tabId, data })
}

async function showExtra({ tabId, url, userSettings, exactBkmIdList }) {
  const isShowVisits = userSettings[USER_OPTION.SHOW_PREVIOUS_VISIT]
  const isShowPartialBookmarks = userSettings[USER_OPTION.USE_PARTIAL_URL_SEARCH]
  const isShowAuthorBookmarks = userSettings[USER_OPTION.URL_SHOW_AUTHOR_TAGS]

  await Promise.all([
    isShowVisits && showVisits({ tabId, url }),
    isShowPartialBookmarks && showPartialBookmarks({ tabId, url, exactBkmIdList }),
    isShowAuthorBookmarks && showAuthorBookmarks({ tabId, url }),
  ])
}

async function updateTab({ tabId, url, debugCaller }) {
  logUTB(`UPDATE-TAB () 00 <- ${debugCaller}`, tabId);
  logUTB('UPDATE-TAB () 11', url);

  const userSettings = await extensionSettings.get()
  const bookmarkList = await getBookmarkListWithTemplate(url)

  let filteredBookmarkList = bookmarkList
  if (userSettings[USER_OPTION.SHOW_VISITED] === SHOW_VISITED_OPTIONS.IF_NO_OTHER) {
    const testBookmarkList = bookmarkList.filter(({ templateTitle }) => !isVisitedDatedTemplate(templateTitle))

    if (0 < testBookmarkList.length) {
      filteredBookmarkList = testBookmarkList
    }
  }

  const isShowTitle = userSettings[USER_OPTION.SHOW_BOOKMARK_TITLE]
  const selectedBookmarkList = filteredBookmarkList
    .map((bookmark) => {
      if (!isShowTitle) {
        delete bookmark.title
      }

      return bookmark
    });

  const data = {
    bookmarkList: selectedBookmarkList,
    fontSize: userSettings[USER_OPTION.FONT_SIZE],
    isShowTitle: userSettings[USER_OPTION.SHOW_BOOKMARK_TITLE],

    isTagListAvailable: tagList.isOn,
    tagList: tagList.list,
    tagListOpenMode: userSettings[USER_OPTION.TAG_LIST_OPEN_MODE],
    isTagListOpenGlobal: tagList.isOpenGlobal,
    tagLength: userSettings[USER_OPTION.TAG_LIST_TAG_LENGTH],
    nTagListAvailableRows: tagList.nAvailableRows,
    pinnedTagPosition: userSettings[USER_OPTION.TAG_LIST_PINNED_TAGS_POSITION],

    isHideSemanticHtmlTagsOnPrinting: userSettings[USER_OPTION.HIDE_TAG_HEADER_ON_PRINTING],
    isHideHeaderForYoutube: userSettings[USER_OPTION.YOUTUBE_HIDE_PAGE_HEADER],
  }
  logUTB('UPDATE-TAB () 99 sendMessage', tabId, data);
  await page.updateBookmarkInfoInPage({ tabId, data })
  await showExtra({
    tabId,
    url,
    userSettings,
    exactBkmIdList: bookmarkList.map(({ id }) => id)
  })
}

async function updateTabTask(options) {
  let tabId = options?.tabId
  let url = options?.url

  if (!tabId) {
    try {
      const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
      const [activeTab] = tabs;

      if (activeTab) {
        tabId = activeTab?.id
        url = activeTab?.url
      }
    // eslint-disable-next-line no-unused-vars
    } catch (_er) {
      return
    }
  }

  if (!url && tabId) {
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

  await initExtension({ debugCaller: 'updateTab ()' })

  await updateTab({
    ...options,
    tabId,
    url,
  })
}

export const updateActiveTab = debounce_leading3(updateTabTask, 50)
