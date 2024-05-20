
import {
  logEvent,
} from '../api/debug.js'
import {
  MENU,
} from '../constants.js';
import {
  closeDuplicateTabs,
  closeBookmarkedTabs,
} from '../api/tabs-list-api.js'
import {
  removeQueryParams,
} from '../api/link-api.js'


export const contextMenusController = {
  async onClicked (OnClickData) {
    logEvent('contextMenus.onClicked <-');

    switch (OnClickData.menuItemId) {
      case MENU.CLOSE_DUPLICATE: {
        closeDuplicateTabs();
        break;
      }
      case MENU.CLOSE_BOOKMARKED: {
        closeBookmarkedTabs();
        break;
      }
      case MENU.CLEAR_URL: {
        const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
        const [activeTab] = tabs;

        if (activeTab?.id && activeTab?.url) {
          const cleanUrl = removeQueryParams(activeTab.url);

          if (activeTab.url !== cleanUrl) {
            logEvent('tabs.sendMessage changeLocationToCleanUrl activeTab.id ->', activeTab.id)
            await chrome.tabs.sendMessage(activeTab.id, {
              command: "changeLocationToCleanUrl",
              cleanUrl,
            })
          }
        }

        break;
      }
    }
  }
}