import {
  getBookmarkInfoUni,
  updateTab,
} from '../api/main-api.js'
import {
  logEvent,
} from '../api/debug.js'

let activeTabId;

export const tabsController = {
  onCreated({ pendingUrl: url, index, id }) {
    logEvent('tabs.onCreated', index, id, url);
    getBookmarkInfoUni({ url, useCache: true });
  },
  async onUpdated(tabId, changeInfo, Tab) {
    logEvent('tabs.onUpdated 00', Tab.index, tabId, changeInfo);
    switch (true) {
      case (changeInfo?.status == 'loading'): {
        if (changeInfo?.url) {
          logEvent('tabs.onUpdated 11 LOADING', Tab.index, tabId, changeInfo.url);
          getBookmarkInfoUni({ url: changeInfo.url, useCache: true });
        }

        break;
      }
      case (changeInfo?.status == 'complete'): {
        logEvent('tabs.onUpdated 11 complete tabId activeTabId', tabId, activeTabId);
        
        if (tabId === activeTabId || !activeTabId) {
          logEvent('tabs.onUpdated 22 COMPLETE', Tab.index, tabId, Tab.url);
          updateTab({
            tabId, 
            url: Tab.url, 
            useCache: true,
            debugCaller: 'tabs.onUpdated(complete)'
          });

          if (!activeTabId) {
            updateTab({
              tabId, 
              url: Tab.url, 
              useCache: true,
              debugCaller: 'tabs.onUpdated(complete)'
            });  
          }
        }
    
        break;
      }
    }
  },
  async onActivated({ tabId }) {
    activeTabId = tabId;
    logEvent('tabs.onActivated 00', tabId);
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
  },
}