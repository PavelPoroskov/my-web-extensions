import {
  memo,
} from '../api-mid/index.js'
import {
  debounce_leading,
  makeLogFunction,
} from '../api-low/index.js'
import {
  clearUrlOnPageOpen,
} from './clearUrlOnPageOpen.js'
import {
  updateActiveTab,
} from './updateTab.js'
import {
  visitedUrls,
} from './visited-urls.js'

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

export const debouncedOnPageReady = debounce_leading(onPageReady, 100)
