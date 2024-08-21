

import {
  logEvent,
} from '../api/log-api.js'
import {
  activeDialog,
  extensionSettings,
} from '../api/structure/index.js'
import {
  clearUrlInTab,
  removeQueryParamsIfTarget,
} from '../api/clean-url-api.js'
import {
  addBookmark,
  deleteBookmark,
  fixTag,
  moveToFlatFolderStructure,
  removeDoubleBookmarks,
  switchShowRecentList,
  unfixTag,
} from '../api/command/index.js'
import {
  updateActiveTab,
  updateTab,
} from '../api/tabs-api.js'
import {
  EXTENSION_COMMAND_ID,
  STORAGE_KEY,
  clearUrlTargetList,
} from '../constant/index.js'

export async function onIncomingMessage (message, sender) {
  switch (message?.command) {

    case EXTENSION_COMMAND_ID.TAB_IS_READY: {
      const tabId = sender?.tab?.id;
      logEvent('runtime.onMessage contentScriptReady', tabId);

      if (tabId) {
        const settings = await extensionSettings.get()
        const url = message.url
        let cleanUrl

        if (settings[STORAGE_KEY.CLEAR_URL]) {
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
      activeDialog.createBkmFromTag(message.parentId)
      await addBookmark({
        url: message.url,
        title: message.title,
        parentId: message.parentId,
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
      await switchShowRecentList(message.value)

      break
    }
    case EXTENSION_COMMAND_ID.FIX_TAG: {
      logEvent('runtime.onMessage fixTag');
      await fixTag({
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
      await unfixTag(message.parentId)
      updateActiveTab({
        debugCaller: 'runtime.onMessage fixTag',
        useCache: true,
      });

      break
    }
    case EXTENSION_COMMAND_ID.OPTIONS_ASKS_DATA: {
      logEvent('runtime.onMessage OPTIONS_ASKS_DATA');

      const settings = await extensionSettings.get();
      chrome.runtime.sendMessage({
        command: EXTENSION_COMMAND_ID.DATA_FOR_OPTIONS,
        clearUrlTargetList,
        STORAGE_KEY,
        settings,
      });

      break
    }
    case EXTENSION_COMMAND_ID.OPTIONS_ASKS_SAVE: {
      logEvent('runtime.onMessage OPTIONS_ASKS_SAVE');
      await extensionSettings.update(message.updateObj)

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
