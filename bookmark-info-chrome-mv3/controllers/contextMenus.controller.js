
import {
  logEvent,
} from '../api/debug.js'
import {
  MENU,
} from '../constants.js';
import {
  closeDuplicateTabs,
  closeBookmarkedTabs,
} from '../api/tabs-api.js'

export const contextMenusController = {
  async onClicked (OnClickData) {
    logEvent('contextMenus.onClicked');

    switch (OnClickData.menuItemId) {
      case MENU.CLOSE_DUPLICATE: {
        closeDuplicateTabs();
        break;
      }
      case MENU.CLOSE_BOOKMARKED: {
        closeBookmarkedTabs();
        break;
      }
    }
  }
}