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
  getDatedTemplate,
  isDatedFolderTitle,
  isVisitedDatedTitle,
} from '../folder-api/index.js'
import {
  getBookmarkInfoUni,
  getPartialBookmarkList,
} from './get-bookmarks.api.js'
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
  datedTemplate,
} from '../bookmark-controller-api/datedTemplate.js';
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

async function showExtra({ tabId, url, settings, exactBkmIdList }) {
  const isShowVisits = settings[USER_OPTION.SHOW_PREVIOUS_VISIT]
  const isShowPartialBookmarks = settings[USER_OPTION.USE_PARTIAL_URL_SEARCH]
  const isShowAuthorBookmarks = settings[USER_OPTION.URL_SHOW_AUTHOR_TAGS]

  await Promise.all([
    isShowVisits && showVisits({ tabId, url }),
    isShowPartialBookmarks && showPartialBookmarks({ tabId, url, exactBkmIdList }),
    isShowAuthorBookmarks && showAuthorBookmarks({ tabId, url }),
  ])
}

async function bookmarkListToTagList(bookmarkList) {
  const resultList = []
  const templateTitleList = []

  bookmarkList.forEach(({ parentId, parentTitle }) => {
    if (isDatedFolderTitle(parentTitle)) {
      if (!isVisitedDatedTitle(parentTitle)) {
        const templateTitle = getDatedTemplate(parentTitle)
        templateTitleList.push(templateTitle)
      }
    } else {
      resultList.push({ parentId, parentTitle })
    }
  })

  const templateTagList = await Promise.all(templateTitleList.map(
    (templateTitle) => datedTemplate.findOrCreateFolder(templateTitle)
      .then((templateId) => ({ parentId: templateId, parentTitle: templateTitle }))
  ))

  return resultList.concat(templateTagList)
}

async function updateTab({ tabId, url, debugCaller, useCache=false }) {
  logUTB(`UPDATE-TAB () 00 <- ${debugCaller}`, tabId);
  logUTB('UPDATE-TAB () 11', url);

  const settings = await extensionSettings.get()
  const isShowTitle = settings[USER_OPTION.SHOW_BOOKMARK_TITLE]
  const bookmarkInfo = await getBookmarkInfoUni({ url, useCache, isShowTitle })

  let bookmarkList = bookmarkInfo.bookmarkList
  if (settings[USER_OPTION.SHOW_VISITED] === SHOW_VISITED_OPTIONS.IF_NO_OTHER) {
    bookmarkList = bookmarkList.filter(({ parentTitle }) => !isVisitedDatedTitle(parentTitle))

    if (bookmarkList.length == 0) {
      bookmarkList = bookmarkInfo.bookmarkList
    }
  }

  const tagFromBookmarkList = await bookmarkListToTagList(bookmarkInfo.bookmarkList)
  const tagListList = tagList.getListWithBookmarks(tagFromBookmarkList)
  // logUTB('updateTab() tagListList', tagListList.length,'tagList.nAvailableRows', tagList.nAvailableRows)
  // logUTB(tagListList)

  const data = {
    bookmarkList,
    fontSize: settings[USER_OPTION.FONT_SIZE],
    isShowTitle: settings[USER_OPTION.SHOW_BOOKMARK_TITLE],

    isTagListAvailable: tagList.isOn,
    tagList: tagListList,
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
  await showExtra({
    tabId,
    url,
    settings,
    exactBkmIdList: bookmarkInfo.bookmarkList.map(({ id }) => id)
  })
}

async function updateTabTask(options) {
  let tabId = options?.tabId
  let url = options?.url

  if (!tabId) {
    const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    const [activeTab] = tabs;

    if (activeTab) {
      tabId = activeTab?.id
      url = activeTab?.url
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
