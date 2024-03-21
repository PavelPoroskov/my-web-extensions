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
}

export const runtimeController = {
  onStartup() {
    logEvent('runtime.onStartup');
    // is only firefox use it?
    createContextMenu()
    updateActiveTab({
      useCache: true,
      debugCaller: 'runtime.onStartup'
    });
  },
  onInstalled () {
    logEvent('runtime.onInstalled');
    createContextMenu()
    updateActiveTab({
      useCache: true,
      debugCaller: 'runtime.onInstalled'
    });
  },
  onMessage (message) {
    logEvent('runtime.onMessage', message);

    switch (message?.command) {
      case "deleteBookmark": {
        logEvent('runtime.onMessage deleteBookmark');
  
        deleteBookmark(message.bkmId);
        break
      }
      case "contentScriptReady": {
        logEvent('runtime.onMessage contentScriptReady');

        if (message.url === memo.activeTabUrl) {
          updateTab({
            tabId: memo.activeTabId,
            url: memo.activeTabUrl,
            useCache: true,
            debugCaller: 'runtime.onMessage contentScriptReady',
          })
        }

        break
      }
    }
  }
};
