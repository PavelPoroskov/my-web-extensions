

import {
  logEvent,
} from '../api/log-api.js'
import {
  memo,
} from '../api/memo.js'
import {
  clearUrlInTab,
  removeQueryParamsIfTarget,
} from '../api/clean-url-api.js'
import {
  deleteBookmark,
} from '../api/bookmarks-api.js'
import {
  updateActiveTab,
  updateTab,
} from '../api/tabs-api.js'
import {
  moveToFlatFolderStructure,
} from '../operation/moveToFlatFolderStructure.js'
import {
  removeDoubleBookmarks,
} from '../operation/removeDoubleBookmarks.js'
import {
  EXTENSION_COMMAND_ID,
  STORAGE_TYPE,
  STORAGE_KEY_META,
  STORAGE_KEY,
  clearUrlTargetList,
} from '../constant/index.js'

export async function onIncomingMessage (message, sender) {
  switch (message?.command) {

    case EXTENSION_COMMAND_ID.TAB_IS_READY: {
      const tabId = sender?.tab?.id;
      logEvent('runtime.onMessage contentScriptReady', tabId);

      if (tabId) {
        const url = message.url
        let cleanUrl

        if (memo.settings[STORAGE_KEY.CLEAR_URL]) {
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
    case EXTENSION_COMMAND_ID.DELETE_BOOKMARK: {
      logEvent('runtime.onMessage deleteBookmark');

      deleteBookmark(message.bkmId);
      break
    }
    case EXTENSION_COMMAND_ID.SHOW_TAG_LIST: {
      logEvent('runtime.onMessage SHOW_RECENT_LIST');

      await memo.updateShowTagList(message.value)
      // updateActiveTab({
      //   debugCaller: 'runtime.onMessage SHOW_RECENT_LIST',
      //   useCache: true,
      // });

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
    case EXTENSION_COMMAND_ID.OPTIONS_ASKS_DATA: {
      logEvent('runtime.onMessage OPTIONS_ASKS_DATA');

      chrome.runtime.sendMessage({
        command: EXTENSION_COMMAND_ID.DATA_FOR_OPTIONS,
        clearUrlTargetList,
        STORAGE_TYPE,
        STORAGE_KEY_META,
        STORAGE_KEY,
      });

      break
    }
    case EXTENSION_COMMAND_ID.OPTIONS_ASKS_FLAT_BOOKMARKS: {
      logEvent('runtime.onMessage OPTIONS_ASKS_FLAT_BOOKMARKS');

      let success

      try {
        await moveToFlatFolderStructure()
        success = true
      } catch (e) {
        console.log('Error on flatting bookmarks', e)
      }
      
      chrome.runtime.sendMessage({
        command: EXTENSION_COMMAND_ID.FLAT_BOOKMARKS_RESULT,
        success,
      });

      break
    }
    case EXTENSION_COMMAND_ID.OPTIONS_ASKS_DELETE_DOUBLES: {
      logEvent('runtime.onMessage OPTIONS_ASKS_DELETE_DOUBLES');

      let success
      let nRemovedDoubles

      try {
        ({ nRemovedDoubles } = await removeDoubleBookmarks())
        success = true
      } catch (e) {
        console.log('Error on flatting bookmarks', e)
      }
      
      chrome.runtime.sendMessage({
        command: EXTENSION_COMMAND_ID.DELETE_DOUBLES_RESULT,
        success,
        nRemovedDoubles,
      });

      break
    }
  }
}
