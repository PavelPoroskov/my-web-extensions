

import {
  logEvent,
} from './log-api.js'
import {
  memo,
} from './memo.js'
import {
  clearUrlInTab,
  removeQueryParamsIfTarget,
} from './clean-url-api.js'
import {
  deleteBookmark,
} from './bookmarks-api.js'
import {
  updateActiveTab,
  updateTab,
} from './tabs-api.js'
import {
  EXTENSION_COMMAND_ID,
  USER_SETTINGS_OPTIONS
} from '../constant/index.js'

export async function onIncomingMessage (message, sender) {

  switch (message?.command) {

    case EXTENSION_COMMAND_ID.DELETE_BOOKMARK: {
      logEvent('runtime.onMessage deleteBookmark');

      deleteBookmark(message.bkmId);
      break
    }
    case EXTENSION_COMMAND_ID.ADD_BOOKMARK: {
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
    case EXTENSION_COMMAND_ID.FIX_TAG: {
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
    case EXTENSION_COMMAND_ID.UNFIX_TAG: {
      logEvent('runtime.onMessage unfixTag');

      await memo.removeFixedTag(message.parentId)
      updateActiveTab({
        debugCaller: 'runtime.onMessage unfixTag',
        useCache: true,
      });

      break
    }
    case EXTENSION_COMMAND_ID.TAB_IS_READY: {
      const tabId = sender?.tab?.id;
      logEvent('runtime.onMessage contentScriptReady', tabId);

      if (tabId) {
        const url = message.url
        let cleanUrl

        if (memo.settings[USER_SETTINGS_OPTIONS.CLEAR_URL_FROM_QUERY_PARAMS]) {
          ({ cleanUrl } = removeQueryParamsIfTarget(url));
          
          if (url !== cleanUrl) {
            await clearUrlInTab({ tabId, cleanUrl })
          }
        }

        updateTab({
          tabId,
          url: cleanUrl || url,
          useCache: true,
          debugCaller: 'runtime.onMessage contentScriptReady',
        })
      }

      break
    }
  }
}
