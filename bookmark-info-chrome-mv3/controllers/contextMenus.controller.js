
import {
  logEvent,
} from '../api/log-api.js'
import {
  CONTEXT_MENU_ID,
} from '../constant/index.js';
import {
  closeDuplicateTabs,
  closeBookmarkedTabs,
} from '../api/tabs-list-api.js'
import {
  clearUrlInTab,
  removeQueryParams,
} from '../api/clean-url-api.js'

export const contextMenusController = {
  async onClicked (OnClickData) {
    logEvent('contextMenus.onClicked <-');

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
        const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
        const [activeTab] = tabs;

        if (activeTab?.id && activeTab?.url) {
          const cleanUrl = removeQueryParams(activeTab.url);

          if (activeTab.url !== cleanUrl) {
            await clearUrlInTab({ tabId: activeTab.id, cleanUrl })
          }
        }

        break;
      }
    }
  }
}