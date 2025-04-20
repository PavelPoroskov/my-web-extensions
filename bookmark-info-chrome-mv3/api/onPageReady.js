import {
  clearUrlOnPageOpen,
} from './clearUrlOnPageOpen.js'
import {
  updateActiveTab,
} from './updateTab.js'
import {
  memo,
  visitedUrls,
} from '../data-structures/index.js'
import {
  debounce,
  makeLogFunction,
} from '../api-low/index.js'

const logPR = makeLogFunction({ module: 'onPageReady.js' })

async function onPageReady({ tabId, url }) {
  logPR('onPageReady 00', tabId, url);

  if (tabId === memo.activeTabId) {
    logPR('onPageReady 11');

    const cleanUrl = await clearUrlOnPageOpen({ tabId, url })

    if (url !== memo.activeTabUrl) {
      logPR('onPageReady 22');
      const Tab = await chrome.tabs.get(tabId);

      if (Tab && memo.activeTabUrl !== 'about:newtab') {
        visitedUrls.onReplaceUrlInActiveTab({
          tabId,
          oldUrl: memo.activeTabUrl,
          newUrl: cleanUrl,
          newTitle: Tab.title,
        });
      }
    }

    memo.activeTabUrl = cleanUrl

    updateActiveTab({
      tabId,
      url: cleanUrl,
      debugCaller: 'onPageReady',
    })
  }
}

export const debouncedOnPageReady = debounce(onPageReady, 50)
