import { page } from '../api-mid/index.js'
import {
  makeLogFunction,
} from '../api-low/index.js'

const logUU = makeLogFunction({ module: 'getUrlFromUrl' })

export async function getUrlFromUrl() {
  logUU('getUrlFromUrl () 00')

  const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  const [activeTab] = tabs;

  if (activeTab?.id && activeTab?.url) {
    let testUrl
    let resultUrl
    const oUrl = new URL(activeTab.url)
    logUU('getUrlFromUrl () 11 oUrl', oUrl)
    const { hostname } = oUrl
    const baseDomain = hostname.split('.').slice(-2).join('.')

    try {
      switch (baseDomain) {
        case '9gag.com': {
          testUrl = oUrl.hash.split('#').at(1)

          break
        }
        case 'dev.to': {
          const decoded = decodeURIComponent(oUrl.pathname)
          const i = decoded.indexOf('https://')

          if (-1 < i) {
            testUrl = decoded.slice(i)
          }

          break
        }
      }

      if (testUrl) {
        const o = new URL(testUrl)

        if (o) {
          resultUrl = testUrl
        }
      }

      // eslint-disable-next-line no-unused-vars
    } catch (e)
    // eslint-disable-next-line no-empty
    {

    }

    if (resultUrl) {
      logUU('getUrlFromUrl () 99 call replaceUrlInTab ()')
      await page.replaceUrlInTab({ tabId: activeTab.id, url: resultUrl })
    }
  }
}
