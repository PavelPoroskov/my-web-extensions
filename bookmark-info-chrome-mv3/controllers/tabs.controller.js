import {
  pageReady,
  debouncedUpdateActiveTab,
  visitedUrls,
} from '../api/index.js'
import {
  extensionSettings,
  memo,
} from '../api-mid/index.js'
import {
  CacheWithLimit,
  makeLogFunction,
} from '../api-low/index.js'
import {
  USER_OPTION,
} from '../constant/index.js'
import {
  isYouTubeChannelWithoutSubdir,
} from '../url-api/index.js'

const logTC = makeLogFunction({ module: 'tabs.controller' })
const redirectedUrl = new CacheWithLimit({ name: 'redirectedUrl', size: 20 })

export const tabsController = {
  // onCreated({ pendingUrl: url, index, id }) {
  //   logTC('tabs.onCreated', index, id, url);
  // },
  async onUpdated(tabId, changeInfo, Tab) {
    logTC('tabs.onUpdated 00', 'tabId', tabId, 'Tab.index', Tab.index);
    logTC('tabs.onUpdated 00 ------changeInfo', changeInfo);

    if (changeInfo?.url) {
      const newUrl = changeInfo.url
      const settings = await extensionSettings.get()

      if (settings[USER_OPTION.YOUTUBE_REDIRECT_CHANNEL_TO_VIDEOS]) {
        if (isYouTubeChannelWithoutSubdir(newUrl)) {

          const isRedirectedBefore = !!redirectedUrl.get(`${tabId}#${newUrl}`)
          logTC('tabs.onUpdated ', newUrl, 'isRedirectedBefore ', isRedirectedBefore);

          if (!isRedirectedBefore) {
            const oUrl = new URL(newUrl)
            oUrl.pathname = `${oUrl.pathname}/videos`
            const redirectUrl = oUrl.toString()
            logTC('tabs.onUpdated ', changeInfo?.status, 'tabId', tabId, 'redirectUrl', redirectUrl);

            redirectedUrl.add(`${tabId}#${newUrl}`)
            await chrome.tabs.update(tabId, { url: redirectUrl })

            return
          }
        }
      }
    }

    if (changeInfo?.url || changeInfo?.title) {
      visitedUrls.onUpdateTab(tabId, changeInfo);
    }

    if (changeInfo?.status == 'complete') {
        if (tabId === memo.activeTabId) {
          debouncedUpdateActiveTab({
            tabId,
            url: Tab.url,
            debugCaller: `tabs.onUpdated complete`,
          })
          await pageReady.onPageReady({
            tabId,
            url: Tab.url,
            title: Tab.title,
            debugCaller: `tabs.onUpdated complete`,
          })
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

    debouncedUpdateActiveTab({
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
        // firefox: only one active tab
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
    // 3) close tab on close window = 1)

    visitedUrls.onCloseTab(tabId)
  }
}
