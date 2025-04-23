import {
  BROWSER_SPECIFIC,
  CONTEXT_MENU_CMD_ID,
  USER_OPTION,
} from '../constant/index.js'
import {
  browserStartTime,
  extensionSettings,
  memo,
  tagList,
} from '../api-mid/index.js'
import {
  makeLogFunction,
} from '../api-low/index.js'
import {
  createBookmarkVisited,
  createBookmarkOpened,
} from '../bookmark-controller-api/bookmark-create.js'
import {
  visitedUrls,
} from './visited-urls.js'

const logIX = makeLogFunction({ module: 'init-extension' })

async function createContextMenu(settings) {
  await chrome.contextMenus.removeAll();

  chrome.contextMenus.create({
    id: CONTEXT_MENU_CMD_ID.ADD_BOOKMARK_FROM_SELECTION_MENU,
    contexts: BROWSER_SPECIFIC.MENU_CONTEXT,
    title: 'add bookmark, selection as a tag',
  });
  chrome.contextMenus.create({
    id: CONTEXT_MENU_CMD_ID.ADD_BOOKMARK_FROM_INPUT_MENU,
    contexts: BROWSER_SPECIFIC.MENU_CONTEXT,
    title: 'add bookmark, tag from input',
  });
  chrome.contextMenus.create({
    id: CONTEXT_MENU_CMD_ID.CLEAR_URL,
    contexts: BROWSER_SPECIFIC.MENU_CONTEXT,
    title: 'clear url from hash and all search params',
  });
  chrome.contextMenus.create({
    id: CONTEXT_MENU_CMD_ID.GET_URL_FROM_URL,
    contexts: BROWSER_SPECIFIC.MENU_CONTEXT,
    title: 'get url from url',
  });
  chrome.contextMenus.create({
    id: CONTEXT_MENU_CMD_ID.CLOSE_DUPLICATE,
    contexts: BROWSER_SPECIFIC.MENU_CONTEXT,
    title: 'close duplicate tabs',
  });
  chrome.contextMenus.create({
    id: CONTEXT_MENU_CMD_ID.CLOSE_BOOKMARKED,
    contexts: BROWSER_SPECIFIC.MENU_CONTEXT,
    title: 'close bookmarked tabs',
  });

  if (settings[USER_OPTION.YOUTUBE_HIDE_PAGE_HEADER]) {
    chrome.contextMenus.create({
      id: CONTEXT_MENU_CMD_ID.TOGGLE_YOUTUBE_HEADER,
      contexts: BROWSER_SPECIFIC.MENU_CONTEXT,
      title: 'toggle youtube page header',
    });
  }
}

export async function setFirstActiveTab({ debugCaller='' }) {
  logIX(`setFirstActiveTab() 00 <- ${debugCaller}`, memo['activeTabId'])

  const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  const [Tab] = tabs;

  if (Tab?.id) {
    memo.activeTabId = Tab.id;
    memo.activeTabUrl = Tab.url

    logIX(`setFirstActiveTab() 11 <- ${debugCaller}`, memo['activeTabId'])
  }
}

async function initFromUserOptions() {
  await extensionSettings.restoreFromStorage()
  const userSettings = await extensionSettings.get()

  await Promise.all([
    createContextMenu(userSettings),
    tagList.readFromStorage(userSettings),
    visitedUrls.connect({
      isOn: userSettings[USER_OPTION.MARK_CLOSED_PAGE_AS_VISITED],
      onMarkUrlVisited: createBookmarkVisited,
      onMarkUrlOpened: createBookmarkOpened,
    }),
  ])
}

export async function initExtension({ debugCaller='' }) {
  const isInitRequired = !browserStartTime.isActual() || !extensionSettings.isActual() || !memo.activeTabId
  if (isInitRequired) {
    logIX(`initExtension() 00 <- ${debugCaller}`)
  }

  await Promise.all([
    !browserStartTime.isActual() && browserStartTime.init(),
    !extensionSettings.isActual() && initFromUserOptions(),
    !memo.activeTabId && setFirstActiveTab({ debugCaller: `initExtension() <- ${debugCaller}` }),
  ])

  if (isInitRequired) {
    logIX('initExtension() end')
  }
}
