import {
  replaceUrlInTab,
} from '../content-script.api.js'
import {
  makeLogFunction,
} from '../log.api.js'

const logUU = makeLogFunction({ module: 'getUrlFromUrl' })

export async function getUrlFromUrl() {
  logUU('getUrlFromUrl () 00')

  const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  const [activeTab] = tabs;

  if (activeTab?.id && activeTab?.url) {
    let resultUrl
    const oUrl = new URL(activeTab.url)
    logUU('getUrlFromUrl () 11 oUrl', oUrl)
    const { hostname } = oUrl
    const baseDomain = hostname.split('.').slice(-2).join('.')

    try {
      switch (baseDomain) {
        case '9gag.com': {
          let param = oUrl.hash
          const testUrl = param.split('#').at(1)
          const o = new URL(testUrl)

          if (o) {
            resultUrl = testUrl
          }

          break
        }
      }
      // eslint-disable-next-line no-unused-vars
    } catch (e) 
    // eslint-disable-next-line no-empty 
    {

    }

    if (resultUrl) {
      logUU('getUrlFromUrl () 99 call replaceUrlInTab ()')
      await replaceUrlInTab({ tabId: activeTab.id, url: resultUrl })
    }
  }
}