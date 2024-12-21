import {
  CONTEXT_MENU_CMD_ID,
} from '../constant/index.js';
import {
  removeFromUrlAnchorAndSearchParamsInActiveTab,
  closeBookmarkedTabs,
  closeDuplicateTabs,
  startAddBookmarkFromSelection,
  toggleYoutubeHeader,
  getUrlFromUrl,
} from '../api/command/index.js'
import {
  makeLogFunction,
} from '../api/log.api.js'

const logCMC = makeLogFunction({ module: 'contextMenu.controller' })

export const contextMenusController = {
  async onClicked (OnClickData) {
    logCMC('contextMenus.onClicked 00', OnClickData.menuItemId);

    switch (OnClickData.menuItemId) {
      case CONTEXT_MENU_CMD_ID.ADD_BOOKMARK_FROM_SELECTION_MENU: {
        startAddBookmarkFromSelection()
        break;
      }
      case CONTEXT_MENU_CMD_ID.CLOSE_DUPLICATE: {
        closeDuplicateTabs();
        break;
      }
      case CONTEXT_MENU_CMD_ID.CLOSE_BOOKMARKED: {
        closeBookmarkedTabs();
        break;
      }
      case CONTEXT_MENU_CMD_ID.CLEAR_URL: {
        removeFromUrlAnchorAndSearchParamsInActiveTab()
        break;
      }
      case CONTEXT_MENU_CMD_ID.GET_URL_FROM_URL: {
        logCMC('contextMenus.onClicked 11 CONTEXT_MENU_CMD_ID.GET_URL_FROM_URL')
        getUrlFromUrl();
        break;
      }
      case CONTEXT_MENU_CMD_ID.TOGGLE_YOUTUBE_HEADER: {
        toggleYoutubeHeader()
        break;
      }
    }
  }
}

