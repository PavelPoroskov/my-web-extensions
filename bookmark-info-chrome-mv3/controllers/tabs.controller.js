
import {
  logDebug,
  logEvent,
  logIgnore,
} from '../api/log-api.js'
import {
  clearUrlInTab,
  removeQueryParamsIfTarget,
} from '../api/clean-url-api.js'
import {
  // deleteUncleanUrlBookmarkForTab,
  getBookmarkInfoUni,
} from '../api/bookmarks-api.js'
import {
  getHistoryInfo,
} from '../api/history-api.js'
import {
  activeDialog,
  extensionSettings,
  memo,
} from '../api/structure/index.js'
import {
  updateTab,
} from '../api/tabs-api.js'

import {
  IS_BROWSER_FIREFOX,
  STORAGE_KEY,
} from '../constant/index.js'


export const tabsController = {
  onCreated({ pendingUrl: url, index, id }) {
    logEvent('tabs.onCreated', index, id, url);
    // We do not have current visit in history on tabs.onCreated(). Only after tabs.onUpdated(status = loading)
    getBookmarkInfoUni({
      url,
      useCache: true,
    });
  },
  async onUpdated(tabId, changeInfo, Tab) {
    logEvent('tabs.onUpdated 00', Tab.index, tabId, changeInfo);

    if (changeInfo?.url) {
      if (memo.activeTabId && tabId === memo.activeTabId) {
        memo.activeTabUrl = changeInfo.url
      }
    }

    switch (changeInfo?.status) {
      case ('loading'): {
        if (changeInfo?.url) {
          const url = changeInfo.url
          logEvent('tabs.onUpdated 11 LOADING', Tab.index, tabId, url);
          let cleanUrl
          const settings = await extensionSettings.get()

          if (settings[STORAGE_KEY.CLEAR_UR]) {
            ({ cleanUrl } = removeQueryParamsIfTarget(url));
            
            if (url !== cleanUrl) {
              await clearUrlInTab({ tabId, cleanUrl })
            }
          }

          const actualUrl = cleanUrl || url
          getBookmarkInfoUni({
            url: actualUrl,
            useCache: true,
          });
          getHistoryInfo({ url: actualUrl, useCache: false })
        }

        break;
      }
      case ('complete'): {
        logEvent('tabs.onUpdated 11 complete tabId activeTabId', tabId, memo.activeTabId);
        
        if (tabId === memo.activeTabId || !memo.activeTabId) {
          logEvent('tabs.onUpdated 22 COMPLETE', Tab.index, tabId, Tab.url);
          updateTab({
            tabId, 
            url: Tab.url, 
            useCache: true,
            debugCaller: 'tabs.onUpdated(complete)'
          });

          if (IS_BROWSER_FIREFOX && !memo.activeTabId) {
            const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
            const [Tab] = tabs;

            if (Tab?.id) {
              chrome.tabs.update(Tab.id, { active: true })
            }
          }
        }
    
        break;
      }
    }
  },
  async onActivated({ tabId }) {
    logEvent('tabs.onActivated 00', tabId);
    activeDialog.onTabChanged(tabId)

    if (memo.activeTabId !== tabId) {
      memo.previousTabId = memo.activeTabId;
      memo.activeTabId = tabId;
    }

    try {
      const Tab = await chrome.tabs.get(tabId);

      if (Tab) {
        logDebug('tabs.onActivated 11', Tab.index, tabId, Tab.url);
        memo.activeTabUrl = Tab.url
        memo.isActiveTabBookmarkManager = (Tab.url && Tab.url.startsWith('chrome://bookmarks'));
      }

      // updateTab({
      //   tabId, 
      //   url: Tab.url, 
      //   useCache: true,
      //   debugCaller: 'tabs.onActivated(useCache: true)'
      // });
      updateTab({
        tabId, 
        url: Tab.url, 
        useCache: false,
        debugCaller: 'tabs.onActivated(useCache: false)'
      });
    } catch (er) {
      logIgnore('tabs.onActivated. IGNORING. tab was deleted', er);
    }

    // deleteUncleanUrlBookmarkForTab(memo.previousTabId)
  },
  // async onRemoved(tabId) {
  //   deleteUncleanUrlBookmarkForTab(tabId)
  // }
}