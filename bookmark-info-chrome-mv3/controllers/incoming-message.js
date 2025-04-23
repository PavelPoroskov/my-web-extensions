import {
  addBookmarkFromRecentTag,
  addBookmarkFolderByName,
  addRecentTagFromView,
  deleteBookmark,
  fixTag,
  moveToFlatFolderStructure,
  unfixTag,
} from '../command/index.js'
import {
  debouncedOnPageReady,
  showAuthorBookmarksStep2,
  updateActiveTab,
} from '../api/index.js'
import {
  EXTENSION_MSG_ID,
  USER_OPTION,
} from '../constant/index.js'
import {
  HOST_LIST_FOR_PAGE_OPTIONS,
} from '../url-api/index.js'
import {
  extensionSettings,
  tagList,
} from '../api-mid/index.js'
import {
  makeLogFunction,
} from '../api-low/index.js'

const logIM = makeLogFunction({ module: 'incoming-message' })

export async function onIncomingMessage (message, sender) {
  const tabId = sender?.tab?.id;

  switch (message?.command) {

    // IT IS ONLY when new tab load first url
    case EXTENSION_MSG_ID.TAB_IS_READY: {
      debouncedOnPageReady({ tabId, url: message.url });

      break
    }
    case EXTENSION_MSG_ID.ADD_BOOKMARK: {
      logIM('runtime.onMessage addBookmark');
      await addBookmarkFromRecentTag({
        url: message.url,
        title: message.title,
        parentId: message.parentId,
      })
      updateActiveTab({
        tabId,
        debugCaller: 'runtime.onMessage ADD_BOOKMARK',
      })

      break
    }
    case EXTENSION_MSG_ID.ADD_BOOKMARK_FOLDER_BY_NAME: {
      logIM('runtime.onMessage ADD_BOOKMARK_FOLDER_BY_NAME', message.folderNameList);
      if (!message.folderNameList) {
        break
      }

      const folderNameList = message.folderNameList
        .map((s) => s.trim())
        .filter(Boolean)

      if (folderNameList.length == 0) {
        break
      }

      await addBookmarkFolderByName({
        url: message.url,
        title: message.title,
        folderNameList,
      })

      updateActiveTab({
        tabId,
        debugCaller: 'runtime.onMessage ADD_BOOKMARK_FOLDER_BY_NAME',
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
      await tagList.openTagList(message.value)

      break
    }
    case EXTENSION_MSG_ID.UPDATE_AVAILABLE_ROWS: {
      logIM('runtime.onMessage UPDATE_AVAILABLE_ROWS', message.value);
      await tagList.updateAvailableRows(message.value)

      updateActiveTab({
        tabId,
        debugCaller: 'runtime.onMessage UPDATE_AVAILABLE_ROWS',
        useCache: true,
      })

      break
    }
    case EXTENSION_MSG_ID.FIX_TAG: {
      logIM('runtime.onMessage fixTag');
      await fixTag({
        parentId: message.parentId,
        title: message.title,
      })

      updateActiveTab({
        tabId,
        debugCaller: 'runtime.onMessage fixTag',
        useCache: true,
      })

      break
    }
    case EXTENSION_MSG_ID.UNFIX_TAG: {
      logIM('runtime.onMessage unfixTag');
      await unfixTag(message.parentId)

      updateActiveTab({
        tabId,
        debugCaller: 'runtime.onMessage unfixTag',
        useCache: true,
      })

      break
    }
    case EXTENSION_MSG_ID.ADD_RECENT_TAG: {
      logIM('runtime.onMessage ADD_RECENT_TAG');
      await addRecentTagFromView(message.bookmarkId)

      //   updateActiveTab({
      //     tabId,
      //     debugCaller: 'runtime.onMessage ADD_RECENT_TAG',
      //     useCache: true,
      //   })

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
    case EXTENSION_MSG_ID.RESULT_AUTHOR: {
      logIM('runtime.onMessage RESULT_AUTHOR', message.authorUrl);
      showAuthorBookmarksStep2({
        tabId,
        url: message.url,
        authorUrl: message.authorUrl,
      })
      break
    }
  }
}
