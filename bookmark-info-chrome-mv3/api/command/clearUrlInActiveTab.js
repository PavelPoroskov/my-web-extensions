
import {
  removeAnchorAndSearchParams,
} from '../url.api.js'
import {
  changeUrlInTab,
} from '../clear-url.api.js'
import {
  makeLogFunction,
} from '../log.api.js'

const logCU = makeLogFunction({ module: 'clearUrlInActiveTab' })

export async function removeFromUrlAnchorAndSearchParamsInActiveTab() {
  logCU('removeFromUrlAnchorAndSearchParamsInActiveTab () 00')
  const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  const [activeTab] = tabs;

  if (activeTab?.id && activeTab?.url) {
    const cleanUrl = removeAnchorAndSearchParams(activeTab.url);
    logCU('removeFromUrlAnchorAndSearchParamsInActiveTab () 22 cleanUrl', cleanUrl)

    if (activeTab.url !== cleanUrl) {
      await changeUrlInTab({ tabId: activeTab.id, url: cleanUrl })
    }
  }
}
