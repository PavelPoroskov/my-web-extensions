import {
  makeLogFunction,
} from '../api/log-api.js'
import {
  debounceQueue,
  memo,
} from '../api/structure/index.js'
import {
  updateTab,
} from '../api/tabs-api.js'

const logTC = makeLogFunction({ module: 'tabs.controller' })

export const tabsController = {
  onCreated({ pendingUrl: url, index, id }) {
    logTC('tabs.onCreated', index, id, url);
  },
  async onUpdated(tabId, changeInfo, Tab) {
    logTC('tabs.onUpdated 00', Tab.index, tabId, changeInfo);

    switch (changeInfo?.status) {

      case ('complete'): {
        logTC('tabs.onUpdated complete', tabId, Tab);
        
        if (tabId === memo.activeTabId && Tab.url != memo.activeTabUrl) {
          logTC('tabs.onUpdated complete chrome.tabs.update');
          // It did not trigger tabsController.onActivated()
          chrome.tabs.update(tabId, { active: true })
        }
    
        break;
      }
    }
  },
  async onActivated({ tabId }) {
    logTC('tabs.onActivated 00', tabId);

    if (memo.activeTabId !== tabId) {
      memo.previousTabId = memo.activeTabId;
      memo.activeTabId = tabId;
    }

    try {
      const Tab = await chrome.tabs.get(tabId);

      if (Tab) {
        logTC('tabs.onActivated 11', Tab.index, tabId, Tab.url);
        memo.activeTabUrl = Tab.url
      }
    } catch (er) {
      logTC('tabs.onActivated. IGNORING. tab was deleted', er);
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