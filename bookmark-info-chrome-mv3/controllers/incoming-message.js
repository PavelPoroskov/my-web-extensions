import {
  createBookmark,
  removeBookmark,
} from '../bookmark-controller-api/index.js'
import {
  moveToFlatFolderStructure,
} from '../command/index.js'
import {
  showAuthorBookmarksStep2,
  updateActiveTab,
  urlEvents,
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
  memo,
  tagList,
} from '../api-mid/index.js'
import {
  makeLogFunction,
} from '../api-low/index.js'

const logIM = makeLogFunction({ module: 'incoming-message.js' })
const logIMT = makeLogFunction({ module: 'incoming-message.js/TAB_IS_READY' })
// const logIMPE = makeLogFunction({ module: 'incoming-message.js/PAGE_EVENT' })

const HandlersWithUpdateTab = {
  [EXTENSION_MSG_ID.ADD_BOOKMARK_FOLDER_BY_ID]: async ({ parentId, url, title }) => {
    logIM('runtime.onMessage ADD_BOOKMARK_FOLDER_BY_ID');
    await createBookmark({
      parentId,
      title,
      url,
    })
  },
  [EXTENSION_MSG_ID.ADD_BOOKMARK_FOLDER_BY_NAME]: async ({ parentTitleList, url, title }) => {
    logIM('runtime.onMessage ADD_BOOKMARK_FOLDER_BY_NAME', parentTitleList);

    await Promise.allSettled(parentTitleList.map(
      (parentTitle) => createBookmark({
        parentTitle,
        url,
        title,
      })
    ))
  },
  [EXTENSION_MSG_ID.DELETE_BOOKMARK]: async ({ bookmarkId }) => {
    logIM('runtime.onMessage DELETE_BOOKMARK', bookmarkId);
    await removeBookmark(bookmarkId);
  },


  [EXTENSION_MSG_ID.FIX_TAG]: async ({ parentId, parentTitle }) => {
    logIM('runtime.onMessage FIX_TAG');
    await tagList.fixTag({ parentId, parentTitle })
  },
  [EXTENSION_MSG_ID.UNFIX_TAG]: async ({ parentId }) => {
    logIM('runtime.onMessage UNFIX_TAG');
    await tagList.unfixTag(parentId)
  },
  [EXTENSION_MSG_ID.UPDATE_AVAILABLE_ROWS]: async ({ value }) => {
    logIM('runtime.onMessage UPDATE_AVAILABLE_ROWS', value);
    await tagList.updateAvailableRows(value)
  },
}

const OtherHandlers = {
  // [EXTENSION_MSG_ID.PAGE_EVENT]: async (messageObj) => {
  //   logIMPE('runtime.onMessage PAGE_EVENT', messageObj);
  // },
  [EXTENSION_MSG_ID.TAB_IS_READY]: async ({ tabId, url }) => {
    logIMT('runtime.onMessage TAB_IS_READY 00/1', url);
    logIMT('runtime.onMessage TAB_IS_READY 00/2', tabId, memo.activeTabId);
    // IT IS ONLY when new tab load first url
    if (tabId === memo.activeTabId) {
      logIMT('runtime.onMessage TAB_IS_READY 11');

      urlEvents.onPageReady({ tabId, url })

      updateActiveTab({
        tabId,
        debugCaller: `runtime.onMessage TAB_IS_READY`,
      })
    }
  },

  [EXTENSION_MSG_ID.SHOW_TAG_LIST]: async ({ value }) => {
    logIM('runtime.onMessage SHOW_TAG_LIST', value);
    await tagList.openTagList(value)
  },

  [EXTENSION_MSG_ID.OPTIONS_ASKS_DATA]: async () => {
    logIM('runtime.onMessage OPTIONS_ASKS_DATA');

    const settings = await extensionSettings.get();
    chrome.runtime.sendMessage({
      command: EXTENSION_MSG_ID.DATA_FOR_OPTIONS,
      HOST_LIST_FOR_PAGE_OPTIONS,
      USER_OPTION,
      settings,
    });
  },
  [EXTENSION_MSG_ID.OPTIONS_ASKS_SAVE]: async ({ updateObj }) => {
    logIM('runtime.onMessage OPTIONS_ASKS_SAVE');
    await extensionSettings.update(updateObj)
  },
  [EXTENSION_MSG_ID.OPTIONS_ASKS_FLAT_BOOKMARKS]: async () => {
    logIM('runtime.onMessage OPTIONS_ASKS_FLAT_BOOKMARKS');

    let success
    try {
      await moveToFlatFolderStructure()
      success = true
    } catch (e) {
      logIM('IGNORE Error on flatting bookmarks', e);
    }

    await chrome.runtime.sendMessage({
      command: EXTENSION_MSG_ID.FLAT_BOOKMARKS_RESULT,
      success,
    });
  },

  [EXTENSION_MSG_ID.RESULT_AUTHOR]: async ({ tabId, url, authorUrl }) => {
    logIM('runtime.onMessage RESULT_AUTHOR', authorUrl);
    showAuthorBookmarksStep2({
      tabId,
      url,
      authorUrl,
    })
  },
}

const allHandlers = {
  ...HandlersWithUpdateTab,
  ...OtherHandlers,
}

export async function onIncomingMessage (message, sender) {
  const tabId = sender?.tab?.id;
  const { command, ...restMessage } = message
  logIM('onIncomingMessage 00', command);

  // ExtensionMessageHandlers[command]?()
  const handler = allHandlers[command]

  if (handler) {
    logIM('onIncomingMessage 11');
    await handler({ ...restMessage, tabId })
    logIM('onIncomingMessage 22');

    if (HandlersWithUpdateTab[command]) {
      logIM('onIncomingMessage 33');
      updateActiveTab({
        tabId,
        debugCaller: `runtime.onMessage ${command}`,
      })
    }
  }
}
