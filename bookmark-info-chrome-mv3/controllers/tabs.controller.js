import {
  makeLogFunction,
} from '../api-low/index.js'
import {
  memo,
} from '../data-structures/index.js'
import {
  updateActiveTab,
} from '../api/updateTab.js'
import {
  clearUrlOnPageOpen,
} from '../api/clearUrlOnPageOpen.js'

const logTC = makeLogFunction({ module: 'tabs.controller' })

export const tabsController = {
  // onCreated({ pendingUrl: url, index, id }) {
  //   logTC('tabs.onCreated', index, id, url);
  // },
  async onUpdated(tabId, changeInfo, Tab) {
    // logTC('tabs.onUpdated 00', 'tabId', tabId, 'Tab.index', Tab.index);
    // logTC('tabs.onUpdated 00 ------changeInfo', changeInfo);

    // if (changeInfo?.url) {
    //   if (tabId === memo.activeTabId) {
    //     if (memo.activeTabUrl != changeInfo.url) {
    //       memo.activeTabUrl = changeInfo.url
    //     }
    //   }
    // }

    switch (changeInfo?.status) {
      case ('complete'): {
        logTC('tabs.onUpdated complete 00', 'tabId', tabId, 'memo.activeTabId', memo.activeTabId);
        logTC('tabs.onUpdated complete 00 -------Tab',Tab);

        if (tabId === memo.activeTabId) {
          logTC('tabs.onUpdated complete 11 tabId === memo.activeTabId');
          // we here after message page-is-ready. that message triggers update. not necessary to update here
          // no message ready in chrome, in the tab click on url
          const url = Tab.url

          if (url !== memo.activeTabUrl) {
            logTC('tabs.onUpdated complete 22 Tab.url !== memo.activeTabUrl');
            memo.activeTabUrl = url
            const cleanUrl = await clearUrlOnPageOpen({ tabId, url })
            updateActiveTab({
              tabId,
              url: cleanUrl,
              debugCaller: 'tabs.onUpdated complete',
            })
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
      tabId,
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
