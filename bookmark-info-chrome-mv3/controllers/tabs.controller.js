import {
  logEvent,
  logIgnore,
} from '../api/debug.js'
import {
  memo,
} from '../api/memo.js'
import {
  getBookmarkInfoUni,
} from '../api/bookmarks-api.js'
import {
  updateTab,
} from '../api/tabs-api.js'
import {
  IS_BROWSER_FIREFOX,
} from '../constants.js'


export const tabsController = {
  onCreated({ pendingUrl: url, index, id }) {
    logEvent('tabs.onCreated', index, id, url);
    getBookmarkInfoUni({
      url,
      useCache: true,
    });
  },
  async onUpdated(tabId, changeInfo, Tab) {
    logEvent('tabs.onUpdated 00', Tab.index, tabId, changeInfo);
    switch (changeInfo?.status) {
      case ('loading'): {
        if (changeInfo?.url) {
          logEvent('tabs.onUpdated 11 LOADING', Tab.index, tabId, changeInfo.url);
          getBookmarkInfoUni({
            url: changeInfo.url,
            useCache: true,
          });
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
    memo.activeTabId = tabId;
    logEvent('tabs.onActivated 00', tabId);

    try {
      const Tab = await chrome.tabs.get(tabId);
      logEvent('tabs.onActivated 11', Tab.index, tabId, Tab.url);
      
      updateTab({
        tabId, 
        url: Tab.url, 
        useCache: true,
        debugCaller: 'tabs.onActivated(useCache: true)'
      });
      updateTab({
        tabId, 
        url: Tab.url, 
        useCache: false,
        debugCaller: 'tabs.onActivated(useCache: false)'
      });
    } catch (er) {
      logIgnore('tabs.onActivated. IGNORING. tab was deleted', er);
    }
  },
}