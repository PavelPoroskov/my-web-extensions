

import {
  logEvent
} from './log-api.js'
import {
  deleteBookmark,
} from './bookmarks-api.js'
import {
  cleanUrlIfTarget,
  updateActiveTab,
  updateTab,
} from './tabs-api.js'
import {
  memo,
} from './memo.js'

export async function onIncomingMessage (message, sender) {

  switch (message?.command) {
    case "deleteBookmark": {
      logEvent('runtime.onMessage deleteBookmark');

      deleteBookmark(message.bkmId);
      break
    }
    case "addBookmark": {
      logEvent('runtime.onMessage addBookmark');
      memo.createBkmInActiveDialogFromTag(message.parentId)
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
