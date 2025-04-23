import {
  extensionSettings,
} from '../api-mid/index.js'
import {
  makeLogFunction,
  isYouTubeChannelWithoutSubdir,
} from '../api-low/index.js'
import {
  CacheWithLimit,
  memo,
} from '../data-structures/index.js'
import {
  debouncedOnPageReady,
  updateActiveTab,
  visitedUrls,
} from '../api/index.js'
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
    logTC('tabs.onUpdated 00', 'tabId', tabId, 'Tab.index', Tab.index);
    logTC('tabs.onUpdated 00 ------changeInfo', changeInfo);

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

    if (changeInfo?.url) {
      visitedUrls.onUpdateTab(tabId, { url: changeInfo.url });
    }
    if (changeInfo?.title) {
      visitedUrls.onUpdateTab(tabId, { title: changeInfo.title });
    }

    switch (changeInfo?.status) {
      case ('complete'): {
        debouncedOnPageReady({ tabId, url: Tab.url });

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
        // console.log('CHANGE memo.activeTabUrl tabs.onActivated 1', memo.activeTabUrl);
        // console.log('CHANGE memo.activeTabUrl tabs.onActivated 2', Tab.url);
        memo.activeTabUrl = Tab.url

        // QUESTION: on open windows with stored tabs. every tab is activated?
        visitedUrls.onActivateTab(tabId, Tab.url, Tab.title)
      }
    } catch (er) {
      logTC('tabs.onActivated. IGNORING. tab was deleted', er);
    }
  },
  async onRemoved(tabId) {
    logTC('tabs.onRemoved 00', tabId);
    // 1) manually close active tab
    // 2) manually close not active tab
    // 3) close tab on close window

    visitedUrls.onCloseTab(tabId)
  }
}
