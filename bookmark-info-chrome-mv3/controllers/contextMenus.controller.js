import {
  CONTEXT_MENU_ID,
} from '../constant/index.js';
import {
  closeDuplicateTabs,
} from '../api/command/closeDuplicateTabs.js'
import {
  closeBookmarkedTabs,
} from '../api/command/closeBookmarkedTabs.js'
import {
  clearUrlInActiveTab,
} from '../api/command/clearUrlInActiveTab.js'

export const contextMenusController = {
  async onClicked (OnClickData) {
    // logEvent('contextMenus.onClicked <-');

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