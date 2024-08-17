import {
  CONTEXT_MENU_ID,
} from '../constant/index.js';
import {
  closeDuplicateTabs,
} from '../operation/closeDuplicateTabs.js'
import {
  closeBookmarkedTabs,
} from '../operation/closeBookmarkedTabs.js'
import {
  clearUrlInActiveTab,
} from '../operation/clearUrlInActiveTab.js'

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