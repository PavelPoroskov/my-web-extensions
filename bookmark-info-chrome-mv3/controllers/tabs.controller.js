import {
  makeLogFunction,
} from '../api/log.api.js'
import {
  memo,
} from '../api/structure/index.js'
import {
  updateActiveTab,
} from '../api/tabs.api.js'

const logTC = makeLogFunction({ module: 'tabs.controller' })

export const tabsController = {
  // onCreated({ pendingUrl: url, index, id }) {
  //   logTC('tabs.onCreated', index, id, url);
  // },
  async onUpdated(tabId, changeInfo, Tab) {
    logTC('tabs.onUpdated 00', Tab.index, tabId, changeInfo);

    // if (changeInfo?.url) {
    //   if (tabId === memo.activeTabId) {
    //     if (memo.activeTabUrl != changeInfo.url) {
    //       memo.activeTabUrl = changeInfo.url
    //     }        
    //   }
    // }

    switch (changeInfo?.status) {
      // case ('loading'): {
      //   if (changeInfo?.url) {
      //     const url = changeInfo.url
      //     logTC('tabs.onUpdated 11 LOADING', Tab.index, tabId, url);
      //     // let cleanUrl
      //     // const settings = await extensionSettings.get()

      //     // if (settings[STORAGE_KEY.CLEAR_URL]) {
      //     //   ({ cleanUrl } = removeQueryParamsIfTarget(url));
            
      //     //   logTC('tabs.onUpdated 22 LOADING', 'cleanUrl', cleanUrl);
      //     //   if (url !== cleanUrl) {
      //     //     // failed to send message. Recipient does not exist
      //     //     await clearUrlInTab ({ tabId, cleanUrl })
      //     //   }
      //     // }
      //   }

      //   break;
      // }
      case ('complete'): {
        logTC('tabs.onUpdated complete', tabId, Tab);
        
        if (tabId === memo.activeTabId) {
          logTC('tabs.onUpdated complete chrome.tabs.update');

          // we here after message page-is-ready. that message triggers update. not necessary to update here
          if (Tab.url !== memo.activeTabUrl) {
            memo.activeTabUrl = Tab.url
            updateActiveTab({
              debugCaller: 'tabs.onUpdated complete'
            });
          }
        }
    
        break;
      }
    }
  },
  async onActivated({ tabId }) {
    logTC('tabs.onActivated 00', 'memo[\'activeTabId\'] <=', tabId);

    // detect tab was changed
    // if (memo.activeTabId !== tabId) {
    //   memo.previousTabId = memo.activeTabId;
    //   memo.activeTabId = tabId;
    // }
    memo.activeTabId = tabId;

    updateActiveTab({
      debugCaller: 'tabs.onActivated'
    });

    try {
      const Tab = await chrome.tabs.get(tabId);

      if (Tab) {
        logTC('tabs.onActivated 11', Tab.index, tabId, Tab.url);
        memo.activeTabUrl = Tab.url
      }
    } catch (er) {
      logTC('tabs.onActivated. IGNORING. tab was deleted', er);
    }
  },
  // // eslint-disable-next-line no-unused-vars
  // async onRemoved(tabId) {
  //   // deleteUncleanUrlBookmarkForTab(tabId)
  // }
}