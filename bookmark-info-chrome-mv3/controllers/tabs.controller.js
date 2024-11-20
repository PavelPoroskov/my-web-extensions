
import {
  logDebug,
  logEvent,
  logIgnore,
} from '../api/log-api.js'
import {
  debounceQueue,
  memo,
} from '../api/structure/index.js'
import {
  updateTab,
} from '../api/tabs-api.js'


export const tabsController = {
  onCreated({ pendingUrl: url, index, id }) {
    logEvent('tabs.onCreated', index, id, url);
  },
  async onUpdated(tabId, changeInfo, Tab) {
    logEvent('tabs.onUpdated 00', Tab.index, tabId, changeInfo);

    switch (changeInfo?.status) {

      case ('complete'): {
        logEvent('tabs.onUpdated complete', tabId, Tab);
        
        if (tabId === memo.activeTabId && Tab.url != memo.activeTabUrl) {
          chrome.tabs.update(tabId, { active: true })
        }
    
        break;
      }
    }
  },
  async onActivated({ tabId }) {
    logEvent('tabs.onActivated 00', tabId);

    if (memo.activeTabId !== tabId) {
      memo.previousTabId = memo.activeTabId;
      memo.activeTabId = tabId;
    }

    try {
      const Tab = await chrome.tabs.get(tabId);

      if (Tab) {
        logDebug('tabs.onActivated 11', Tab.index, tabId, Tab.url);
        memo.activeTabUrl = Tab.url
      }
    } catch (er) {
      logIgnore('tabs.onActivated. IGNORING. tab was deleted', er);
    }

    updateTab({
      tabId, 
      debugCaller: 'tabs.onActivated'
    });
  },
  async onRemoved(tabId) {
    // deleteUncleanUrlBookmarkForTab(tabId)
    debounceQueue.cancelTask(tabId)
  }
}