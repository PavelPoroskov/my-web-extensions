import {
  CONTEXT_MENU_CMD_ID,
} from '../constant/index.js';
import {
  removeFromUrlHashAndSearchParamsInActiveTab,
  closeDuplicateTabs,
  startAddBookmarkFromInput,
  startAddBookmarkFromSelection,
  startAddBookmarkFromSelectionAndEdit,
  toggleYoutubeHeader,
  getUrlFromUrl,
  sortTabsByTitle,
} from '../command/index.js'
import {
  makeLogFunction,
} from '../api-low/index.js'

const logCMC = makeLogFunction({ module: 'contextMenu.controller' })

export const contextMenusController = {
  async onClicked (OnClickData) {
    logCMC('contextMenus.onClicked 00', OnClickData.menuItemId);

    switch (OnClickData.menuItemId) {
      case CONTEXT_MENU_CMD_ID.BOOKMARK_ADD_FROM_INPUT_MENU: {
        startAddBookmarkFromInput()
        break;
      }
      case CONTEXT_MENU_CMD_ID.BOOKMARK_ADD_FROM_SELECTION_MENU: {
        startAddBookmarkFromSelection()
        break;
      }
      case CONTEXT_MENU_CMD_ID.BOOKMARK_ADD_FROM_SELECTION_AND_EDIT: {
        startAddBookmarkFromSelectionAndEdit()
        break;
      }
      case CONTEXT_MENU_CMD_ID.TABS_CLOSE_DUPLICATE: {
        closeDuplicateTabs();
        break;
      }
      case CONTEXT_MENU_CMD_ID.TABS_SORT_BY_TITLE: {
        sortTabsByTitle();
        break;
      }
      case CONTEXT_MENU_CMD_ID.URL_CLEAR: {
        removeFromUrlHashAndSearchParamsInActiveTab()
        break;
      }
      case CONTEXT_MENU_CMD_ID.URL_GET_URL_FROM_URL: {
        getUrlFromUrl();
        break;
      }
      case CONTEXT_MENU_CMD_ID.YOUTUBE_TOGGLE_PAGE_HEADER: {
        toggleYoutubeHeader()
        break;
      }
    }
  }
}

