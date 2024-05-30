import {
  logEvent,
} from '../api/debug.js'
import {
  memo,
} from '../api/memo.js'
import {
  deleteBookmark,
} from '../api/bookmarks-api.js'
import {
  updateTab,
  updateActiveTab,
} from '../api/tabs-api.js'
import {
  MENU,
  BROWSER_SPECIFIC,
  USER_SETTINGS_OPTIONS,
} from '../constants.js'

async function createContextMenu() {
  await chrome.contextMenus.removeAll();

  chrome.contextMenus.create({
    id: MENU.CLOSE_DUPLICATE,
    contexts: BROWSER_SPECIFIC.MENU_CONTEXT,
    title: 'close duplicate tabs',
  });  
  // TODO? bookmark and close all tabs (tabs without bookmarks and tabs with bookmarks)
  //   copy bookmarked tabs
  chrome.contextMenus.create({
    id: MENU.CLOSE_BOOKMARKED,
    contexts: BROWSER_SPECIFIC.MENU_CONTEXT,
    title: 'close bookmarked tabs',
  });
  // TODO? bookmark and close tabs (tabs without bookmarks)
  chrome.contextMenus.create({
    id: MENU.CLEAR_URL,
    contexts: BROWSER_SPECIFIC.MENU_CONTEXT,
    title: 'clear url',
  });
}

export const runtimeController = {
  onStartup() {
    logEvent('runtime.onStartup');
    memo.setProfileStartTime()
    memo.readActualSettings()
    // is only firefox use it?
    createContextMenu()
    updateActiveTab({
      useCache: true,
      debugCaller: 'runtime.onStartup'
    });
  },
  onInstalled () {
    logEvent('runtime.onInstalled');
    memo.setProfileStartTime()
    memo.readActualSettings()
    createContextMenu()
    updateActiveTab({
      useCache: true,
      debugCaller: 'runtime.onInstalled'
    });
  },
  onMessage (message, sender) {
    logEvent('runtime.onMessage message', message);

    switch (message?.command) {
      case "deleteBookmark": {
        logEvent('runtime.onMessage deleteBookmark');
  
        deleteBookmark(message.bkmId);
        break
      }
      case "contentScriptReady": {
        const senderTabId = sender?.tab?.id;
        logEvent('runtime.onMessage contentScriptReady', senderTabId);

        if (senderTabId) {
          updateTab({
            tabId: senderTabId,
            url: message.url,
            useCache: true,
            debugCaller: 'runtime.onMessage contentScriptReady',
          })
        }

        break
      }
      case "optionsChanged": {
        logEvent('runtime.onMessage optionsChanged');
        memo.readActualSettings()

        if (message?.optionId === USER_SETTINGS_OPTIONS.SHOW_PREVIOUS_VISIT) {
          memo.cacheUrlToVisitList.clear()
        }

        break
      }
    }
  }
};
