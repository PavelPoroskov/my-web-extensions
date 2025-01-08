import {
  addBookmark,
  addBookmarkFolderByName,
  addRecentTagFromView,
  deleteBookmark,
  fixTag,
  moveToFlatFolderStructure,
  switchShowRecentList,
  unfixTag,
} from '../command/index.js'
import {
  extensionSettings,
  memo,
} from '../data-structures/index.js'
import {
  updateActiveTab,
} from '../api/tabs.api.js'
import {
  clearUrlOnPageOpen,
} from '../api/clear-url.api.js'
import {
  EXTENSION_MSG_ID,
} from '../constant/index.js'
import {
  USER_OPTION,
} from '../api/storage.api.js'
import {
  HOST_LIST_FOR_PAGE_OPTIONS,
} from '../api/url.api.config.js'
import {
  makeLogFunction,
} from '../api/log.api.js'

const logIM = makeLogFunction({ module: 'incoming-message' })

export async function onIncomingMessage (message, sender) {
  switch (message?.command) {

    // IT IS ONLY when new tab load first url
    case EXTENSION_MSG_ID.TAB_IS_READY: {
      const tabId = sender?.tab?.id;
      const url = message.url
      logIM('runtime.onMessage contentScriptReady 00', 'tabId', tabId, 'memo[\'activeTabId\']', memo['activeTabId']);
      logIM('#  runtime.onMessage contentScriptReady 00', url);

      if (tabId && tabId == memo.activeTabId) {
        logIM('runtime.onMessage contentScriptReady 11 updateTab', 'tabId', tabId, 'memo[\'activeTabId\']', memo['activeTabId']);
        memo.activeTabUrl = url
        const cleanUrl = await clearUrlOnPageOpen({ tabId, url })
        updateActiveTab({
          tabId,
          url: cleanUrl,
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

      deleteBookmark(message.bookmarkId);
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
          tabId,
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
          tabId,
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
      //     tabId,
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
    case EXTENSION_MSG_ID.ADD_BOOKMARK_FOLDER_BY_NAME: {
      logIM('runtime.onMessage ADD_BOOKMARK_FOLDER_BY_NAME', message.folderName);
      if (!message.folderName) {
        break
      }
      const folderName = message.folderName.trim()
      if (!folderName) {
        break
      }

      const isAddedNewBookmark = await addBookmarkFolderByName({
        url: message.url,
        title: message.title,
        folderName: folderName,
      })
      if (!isAddedNewBookmark) {
        // to remove optimistic add
        const tabId = sender?.tab?.id;
        if (tabId == memo.activeTabId) {
          updateActiveTab({
            tabId,
            debugCaller: 'runtime.onMessage ADD_BOOKMARK_FOLDER_BY_NAME',
            useCache: true,
          })
        }
      }
      break
    }
  }
}
