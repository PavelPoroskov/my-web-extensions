import {
  addBookmark,
  addBookmarkFromSelection,
  addRecentTagFromView,
  deleteBookmark,
  fixTag,
  moveToFlatFolderStructure,
  switchShowRecentList,
  unfixTag,
  clearUrlOnPageOpen,
} from '../api/command/index.js'
import {
  extensionSettings,
  memo,
} from '../api/structure/index.js'
import {
  updateActiveTab,
} from '../api/tabs.api.js'
import {
  EXTENSION_MSG_ID,
} from '../constant/index.js'
import {
  USER_OPTION,
} from '../api/storage.api.config.js'
import {
  HOST_LIST_FOR_PAGE_OPTIONS,
} from '../api/url.api.config.js'
import {
  makeLogFunction,
} from '../api/log.api.js'

const logIM = makeLogFunction({ module: 'incoming-message' })

export async function onIncomingMessage (message, sender) {
  switch (message?.command) {

    case EXTENSION_MSG_ID.TAB_IS_READY: {
      const tabId = sender?.tab?.id;
      const url = message.url
      logIM('runtime.onMessage contentScriptReady 00', 'tabId', tabId, 'memo[\'activeTabId\']', memo['activeTabId']);
      logIM('#  runtime.onMessage contentScriptReady 00', url);

      if (tabId && tabId == memo.activeTabId) {
        await clearUrlOnPageOpen({ tabId, url })

        memo.activeTabUrl = url
        logIM('runtime.onMessage contentScriptReady 11 updateTab', 'tabId', tabId, 'memo[\'activeTabId\']', memo['activeTabId']);
        updateActiveTab({
          debugCaller: 'runtime.onMessage contentScriptReady',
        })
      }

      break
    }
    case EXTENSION_MSG_ID.ADD_BOOKMARK: {
      logIM('runtime.onMessage addBookmark');
      await addBookmark({
        url: message.url,
        title: message.title,
        parentId: message.parentId,
      })

      break
    }
    case EXTENSION_MSG_ID.DELETE_BOOKMARK: {
      logIM('runtime.onMessage deleteBookmark');

      deleteBookmark(message.bkmId);
      break
    }
    case EXTENSION_MSG_ID.SHOW_TAG_LIST: {
      logIM('runtime.onMessage SHOW_RECENT_LIST');
      await switchShowRecentList(message.value)

      break
    }
    case EXTENSION_MSG_ID.FIX_TAG: {
      logIM('runtime.onMessage fixTag');
      await fixTag({
        parentId: message.parentId, 
        title: message.title,
      })

      const tabId = sender?.tab?.id;
      if (tabId == memo.activeTabId) {
        updateActiveTab({
          debugCaller: 'runtime.onMessage fixTag',
          useCache: true,
        })
      }

      break
    }
    case EXTENSION_MSG_ID.UNFIX_TAG: {
      logIM('runtime.onMessage unfixTag');
      await unfixTag(message.parentId)

      const tabId = sender?.tab?.id;
      if (tabId == memo.activeTabId) {
        updateActiveTab({
          debugCaller: 'runtime.onMessage unfixTag',
          useCache: true,
        })
      }

      break
    }
    case EXTENSION_MSG_ID.ADD_RECENT_TAG: {
      logIM('runtime.onMessage ADD_RECENT_TAG');
      await addRecentTagFromView(message.bookmarkId)

      // const tabId = sender?.tab?.id;
      // if (tabId == memo.activeTabId) {
      //   updateActiveTab({
      //     debugCaller: 'runtime.onMessage ADD_RECENT_TAG',
      //     useCache: true,
      //   })
      // }

      break
    }
    case EXTENSION_MSG_ID.OPTIONS_ASKS_DATA: {
      logIM('runtime.onMessage OPTIONS_ASKS_DATA');

      const settings = await extensionSettings.get();
      chrome.runtime.sendMessage({
        command: EXTENSION_MSG_ID.DATA_FOR_OPTIONS,
        HOST_LIST_FOR_PAGE_OPTIONS,
        USER_OPTION,
        settings,
      });

      break
    }
    case EXTENSION_MSG_ID.OPTIONS_ASKS_SAVE: {
      logIM('runtime.onMessage OPTIONS_ASKS_SAVE');
      await extensionSettings.update(message.updateObj)

      break
    }
    case EXTENSION_MSG_ID.OPTIONS_ASKS_FLAT_BOOKMARKS: {
      logIM('runtime.onMessage OPTIONS_ASKS_FLAT_BOOKMARKS');

      let success

      try {
        await moveToFlatFolderStructure()
        success = true
      } catch (e) {
        logIM('IGNORE Error on flatting bookmarks', e);
      }
      
      chrome.runtime.sendMessage({
        command: EXTENSION_MSG_ID.FLAT_BOOKMARKS_RESULT,
        success,
      });

      break
    }
    case EXTENSION_MSG_ID.ADD_BOOKMARK_FROM_SELECTION_EXT: {
      logIM('runtime.onMessage ADD_BOOKMARK_FROM_SELECTION_EXT', message.selection);

      await addBookmarkFromSelection({
        url: message.url,
        title: message.title,
        selection: message.selection,
      })

      break
    }
  }
}
