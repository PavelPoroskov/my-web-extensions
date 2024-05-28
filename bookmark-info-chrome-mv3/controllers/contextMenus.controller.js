
import {
  logEvent,
  logSendEvent,
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
            const msg = {
              command: "changeLocationToCleanUrl",
              cleanUrl,
            }
            logSendEvent('contextMenusController.onClicked(CLEAR_URL)', activeTab.id, msg)
            await chrome.tabs.sendMessage(activeTab.id, msg)
          }
        }

        break;
      }
    }
  }
}