import {
  deleteBookmark,
} from '../api/bookmarks-api.js'
import {
  logEvent
} from '../api/debug.js'
import {
  cleanUrlIfTarget,
  updateActiveTab,
  updateTab,
} from '../api/tabs-api.js'
import {
  memo,
} from '../api/memo.js'
import {
  BROWSER_SPECIFIC,
  MENU,
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
  async onStartup() {
    logEvent('runtime.onStartup');
    // is only firefox use it?
    createContextMenu()
    updateActiveTab({
      useCache: true,
      debugCaller: 'runtime.onStartup'
    });
  },
  async onInstalled () {
    logEvent('runtime.onInstalled');
    createContextMenu()
    updateActiveTab({
      useCache: true,
      debugCaller: 'runtime.onInstalled'
    });
  },
  async onMessage (message, sender) {
    logEvent('runtime.onMessage message', message);

    switch (message?.command) {
      case "deleteBookmark": {
        logEvent('runtime.onMessage deleteBookmark');
  
        deleteBookmark(message.bkmId);
        break
      }
      case "addBookmark": {
        logEvent('runtime.onMessage addBookmark');
  
        await chrome.bookmarks.create({
          index: 0,
          parentId: message.parentId,
          title: message.title,
          url: message.url
        })

        break
      }
      case "fixTag": {
        logEvent('runtime.onMessage fixTag');
  
        await memo.addFixedTag({
          parentId: message.parentId,
          title: message.title,
        })
        updateActiveTab({
          debugCaller: 'runtime.onMessage fixTag',
          useCache: true,
        });
    
        break
      }
      case "unfixTag": {
        logEvent('runtime.onMessage unfixTag');
  
        await memo.removeFixedTag(message.parentId)
        updateActiveTab({
          debugCaller: 'runtime.onMessage unfixTag',
          useCache: true,
        });

        break
      }
      case "contentScriptReady": {
        const senderTabId = sender?.tab?.id;
        logEvent('runtime.onMessage contentScriptReady', senderTabId);

        if (senderTabId) {
          const cleanUrl = await cleanUrlIfTarget({ url: message.url, tabId: senderTabId })
          updateTab({
            tabId: senderTabId,
            url: cleanUrl || message.url,
            useCache: true,
            debugCaller: 'runtime.onMessage contentScriptReady',
          })
        }

        break
      }
    }
  }
};
