import {
  addBookmark,
  addRecentTagFromView,
  deleteBookmark,
  fixTag,
  moveToFlatFolderStructure,
  switchShowRecentList,
  unfixTag,
} from '../api/command/index.js'
import {
  extensionSettings,
  memo,
} from '../api/structure/index.js'
import {
  updateTab,
} from '../api/tabs-api.js'
import {
  EXTENSION_COMMAND_ID,
  STORAGE_KEY,
  clearUrlTargetList,
} from '../constant/index.js'
import {
  makeLogFunction,
} from '../api/log-api.js'

const logIM = makeLogFunction({ module: 'incoming-message' })

export async function onIncomingMessage (message, sender) {
  switch (message?.command) {

    case EXTENSION_COMMAND_ID.TAB_IS_READY: {
      const tabId = sender?.tab?.id;

      if (tabId && tabId == memo.activeTabId) {
        logIM('runtime.onMessage contentScriptReady', tabId);
        updateTab({
          tabId,
          debugCaller: 'runtime.onMessage contentScriptReady',
        })
      }

      break
    }
    case EXTENSION_COMMAND_ID.ADD_BOOKMARK: {
      logIM('runtime.onMessage addBookmark');
      await addBookmark({
        url: message.url,
        title: message.title,
        parentId: message.parentId,
      })

      break
    }
    case EXTENSION_COMMAND_ID.DELETE_BOOKMARK: {
      logIM('runtime.onMessage deleteBookmark');

      deleteBookmark(message.bkmId);
      break
    }
    case EXTENSION_COMMAND_ID.SHOW_TAG_LIST: {
      logIM('runtime.onMessage SHOW_RECENT_LIST');
      await switchShowRecentList(message.value)

      break
    }
    case EXTENSION_COMMAND_ID.FIX_TAG: {
      logIM('runtime.onMessage fixTag');
      await fixTag({
        parentId: message.parentId, 
        title: message.title,
      })

      const tabId = sender?.tab?.id;
      updateTab({
        tabId,
        debugCaller: 'runtime.onMessage fixTag',
        useCache: true,
      })

      break
    }
    case EXTENSION_COMMAND_ID.UNFIX_TAG: {
      logIM('runtime.onMessage unfixTag');
      await unfixTag(message.parentId)

      const tabId = sender?.tab?.id;
      updateTab({
        tabId,
        debugCaller: 'runtime.onMessage unfixTag',
        useCache: true,
      })

      break
    }
    case EXTENSION_COMMAND_ID.ADD_RECENT_TAG: {
      logIM('runtime.onMessage ADD_RECENT_TAG');
      await addRecentTagFromView(message.bookmarkId)

      break
    }
    case EXTENSION_COMMAND_ID.OPTIONS_ASKS_DATA: {
      logIM('runtime.onMessage OPTIONS_ASKS_DATA');

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
      logIM('runtime.onMessage OPTIONS_ASKS_SAVE');
      await extensionSettings.update(message.updateObj)

      break
    }
    case EXTENSION_COMMAND_ID.OPTIONS_ASKS_FLAT_BOOKMARKS: {
      logIM('runtime.onMessage OPTIONS_ASKS_FLAT_BOOKMARKS');

      let success

      try {
        await moveToFlatFolderStructure()
        success = true
      } catch (e) {
        logIM('IGNORE Error on flatting bookmarks', e);
      }
      
      chrome.runtime.sendMessage({
        command: EXTENSION_COMMAND_ID.FLAT_BOOKMARKS_RESULT,
        success,
      });

      break
    }
  }
}
