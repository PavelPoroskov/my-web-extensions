import {
  memo,
  page,
} from '../api-mid/index.js'
import {
  makeLogFunction,
} from '../api-low/index.js'
import {
  removeQueryParamsIfTarget,
} from '../url-api/index.js'
import {
  visitedUrls,
} from './visited-urls.js'

const logPR = makeLogFunction({ module: 'pageReady.js' })

class PageReady {
  constructor () {
  }

  clearUrlOnPageOpen = ({ url }) => url

  async _clearUrlOnPageOpen({ tabId, url }) {
    let cleanUrl = removeQueryParamsIfTarget(url);

    if (url !== cleanUrl) {
      await page.changeUrlInTab({ tabId, url: cleanUrl })
    }

    return cleanUrl || url
  }

  useSettings({ isDoCleanUrl }) {
    if (isDoCleanUrl) {
      this.clearUrlOnPageOpen = this._clearUrlOnPageOpen
    } else {
      this.clearUrlOnPageOpen = ({ url }) => url
    }
  }

  async onPageReady({ tabId, url, debugCaller }) {
    if (url.startsWith('chrome:') || url.startsWith('about:')) {
      return
    }
    logPR(`onPageReady 00 <-${debugCaller}`, tabId)
    logPR('onPageReady 11', url)

    const cleanUrl = await this.clearUrlOnPageOpen({ tabId, url })
    const cleanedActiveTabUrl = removeQueryParamsIfTarget(memo.activeTabUrl);

    if (cleanUrl !== cleanedActiveTabUrl) {
      logPR('onPageReady 22');
      const Tab = await chrome.tabs.get(tabId);

      if (Tab) {
        visitedUrls.onReplaceUrlInActiveTab({
          tabId,
          oldUrl: memo.activeTabUrl,
          newUrl: cleanUrl,
          newTitle: Tab.title,
        });
      }

      memo.activeTabUrl = url
    }
  }
}

export const pageReady = new PageReady()
