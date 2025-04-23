import {
  removeHashAndSearchParams,
} from '../url-api/index.js'
import { page } from '../api-mid/index.js'
import {
  makeLogFunction,
} from '../api-low/index.js'

const logCU = makeLogFunction({ module: 'clearUrlInActiveTab.js' })

export async function removeFromUrlHashAndSearchParamsInActiveTab() {
  logCU('removeFromUrlHashAndSearchParamsInActiveTab () 00')
  const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  const [activeTab] = tabs;

  if (activeTab?.id && activeTab?.url) {
    const cleanUrl = removeHashAndSearchParams(activeTab.url);
    logCU('removeFromUrlHashAndSearchParamsInActiveTab () 22 cleanUrl', cleanUrl)

    if (activeTab.url !== cleanUrl) {
      await page.changeUrlInTab({ tabId: activeTab.id, url: cleanUrl })
    }
  }
}
