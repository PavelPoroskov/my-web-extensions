import {
  getBookmarkInfoUni,
  updateTab,
} from '../api/main-api.js'
import {
  log,
} from '../api/debug.js'

export const tabsController = {
  onCreated({ pendingUrl: url, index, id }) {
    log('tabs.onCreated', index, id, url);
    getBookmarkInfoUni({ url, useCache: true });
  },
  async onUpdated(tabId, changeInfo, Tab) {
    log('tabs.onUpdated', Tab.index, tabId, changeInfo);
    switch (true) {
      case (changeInfo?.status == 'loading'): {
        if (changeInfo?.url) {
          log('tabs.onUpdated LOADING', Tab.index, tabId, changeInfo.url);
          getBookmarkInfoUni({ url: changeInfo.url, useCache: true });
        }

        break;
      }
      case (changeInfo?.status == 'complete'): {
        log('tabs.onUpdated COMPLETE', Tab.index, tabId, Tab.url);
        updateTab({
          tabId, 
          url: Tab.url, 
          useCache: true,
        });
    
        break;
      }
    }
  },
  async onActivated({ tabId }) {
    log('tabs.onActivated 00', tabId);
    const Tab = await chrome.tabs.get(tabId);
    log('tabs.onActivated 11', Tab.index, tabId, Tab.url);
    
    updateTab({
      tabId, 
      url: Tab.url, 
      useCache: true,
    });
  },
}