import {
  BROWSER_SPECIFIC,
  CONTEXT_MENU_CMD_ID,
  STORAGE_KEY,
} from '../constant/index.js'
import {
  browserStartTime,
  extensionSettings,
  tagList,
  memo,
} from './structure/index.js'
import {
  makeLogFunction,
} from './log.api.js'

const logIX = makeLogFunction({ module: 'init-extension' })

export async function createContextMenu(settings) {
  await chrome.contextMenus.removeAll();

  chrome.contextMenus.create({
    id: CONTEXT_MENU_CMD_ID.ADD_BOOKMARK_FROM_SELECTION_MENU,
    contexts: BROWSER_SPECIFIC.MENU_CONTEXT,
    title: 'add bookmark, selection as a tag',
  });  
  chrome.contextMenus.create({
    id: CONTEXT_MENU_CMD_ID.CLEAR_URL,
    contexts: BROWSER_SPECIFIC.MENU_CONTEXT,
    title: 'clear url from anchor and all search params',
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

  if (settings[STORAGE_KEY.HIDE_PAGE_HEADER_FOR_YOUTUBE]) {
    chrome.contextMenus.create({
      id: CONTEXT_MENU_CMD_ID.TOGGLE_YOUTUBE_HEADER,
      contexts: BROWSER_SPECIFIC.MENU_CONTEXT,
      title: 'toggle youtube page header',
    });  
  }
}

export async function setFirstActiveTab({ debugCaller='' }) {
  logIX(`setFirstActiveTab() 00 <- ${debugCaller}`, memo['activeTabId'])

  if (!memo.activeTabId) {
    const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    const [Tab] = tabs;

    if (Tab?.id) {
      memo.activeTabId = Tab.id;
      memo.activeTabUrl = Tab.url

      logIX(`setFirstActiveTab() 11 <- ${debugCaller}`, memo['activeTabId'])
    }
  }
}

async function initFromUserOptions() {
  await extensionSettings.restoreFromStorage()
  const settings = await extensionSettings.get()

  await Promise.all([
    createContextMenu(settings),
    tagList.readFromStorage(),
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