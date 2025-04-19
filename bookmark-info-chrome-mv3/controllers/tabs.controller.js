import {
  extensionSettings,
  makeLogFunction,
  isYouTubeChannelWithoutSubdir,
} from '../api-low/index.js'
import {
  CacheWithLimit,
  memo,
  visitedUrls,
} from '../data-structures/index.js'
import {
  updateActiveTab,
} from '../api/updateTab.js'
import {
  clearUrlOnPageOpen,
} from '../api/clearUrlOnPageOpen.js'
import {
  USER_OPTION,
} from '../constant/index.js'

const logTC = makeLogFunction({ module: 'tabs.controller' })
const redirectedUrl = new CacheWithLimit({ name: 'redirectedUrl', size: 20 })

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

    let checkUrl
    switch (changeInfo?.status) {
      case ('loading'): {
        checkUrl = changeInfo?.url
        break;
      }
      case ('complete'): {
        checkUrl = changeInfo?.url
        break;
      }
    }

    if (checkUrl) {
      const settings = await extensionSettings.get()

      if (settings[USER_OPTION.YOUTUBE_REDIRECT_CHANNEL_TO_VIDEOS]) {
        const oUrl = new URL(checkUrl)

        if (isYouTubeChannelWithoutSubdir(oUrl)) {
          const isRedirectedBefore = !!redirectedUrl.get(`${tabId}#${checkUrl}`)
          logTC('tabs.onUpdated ', checkUrl, 'isRedirectedBefore ', isRedirectedBefore);

          if (!isRedirectedBefore) {
            oUrl.pathname = `${oUrl.pathname}/videos`
            const redirectUrl = oUrl.toString()
            logTC('tabs.onUpdated ', changeInfo?.status, 'tabId', tabId, 'redirectUrl', redirectUrl);

            redirectedUrl.add(`${tabId}#${checkUrl}`)
            await chrome.tabs.update(tabId, { url: redirectUrl })
            return
          }
        }
      }
    }

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
            const cleanUrl = await clearUrlOnPageOpen({ tabId, url })
            visitedUrls.onCloseUrl(memo.activeTabUrl)
            visitedUrls.onVisitUrl(cleanUrl, Tab.title, tabId)
            memo.activeTabUrl = cleanUrl
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

        // QUESTION: on open windows with stored tabs. every tab is activated?
        visitedUrls.onVisitUrl(memo.activeTabUrl, Tab.title, tabId)
      }
    } catch (er) {
      logTC('tabs.onActivated. IGNORING. tab was deleted', er);
    }
  },
  async onRemoved(tabId) {
    // if (isWindowClosing) {
    //   return
    // }

    // 1) manually close active tab
    // 2) manually close not active tab?
    // 3) close tab on close window

    // visited page
    //  url in active tab
    //  ?user scroll
    //  user close

    visitedUrls.onCloseTab(tabId)
  }
}
