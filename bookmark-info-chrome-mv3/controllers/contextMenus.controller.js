import {
  CONTEXT_MENU_ID,
} from '../constant/index.js';
import {
  clearUrlInActiveTab,
  closeBookmarkedTabs,
  closeDuplicateTabs,
} from '../api/command/index.js'
import {
  makeLogFunction,
} from '../api/log-api.js'

const logCMC = makeLogFunction({ module: 'contextMenu.controller' })

export const contextMenusController = {
  async onClicked (OnClickData) {
    logCMC('contextMenus.onClicked <- EVENT');

    switch (OnClickData.menuItemId) {
      case CONTEXT_MENU_ID.CLOSE_DUPLICATE: {
        closeDuplicateTabs();
        break;
      }
      case CONTEXT_MENU_ID.CLOSE_BOOKMARKED: {
        closeBookmarkedTabs();
        break;
      }
      case CONTEXT_MENU_ID.CLEAR_URL: {
        clearUrlInActiveTab()
        break;
      }
    }
  }
}