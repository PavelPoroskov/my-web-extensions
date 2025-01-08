
import {
  changeUrlInTab,
} from '../api/content-script.api.js'
import {
  makeLogFunction,
} from '../api-low/index.js'

const logCU = makeLogFunction({ module: 'clearUrlInActiveTab' })

function removeHashAndSearchParams(url) {
  logCU('removeHashAndSearchParams () 00', url)
  try {
    const oUrl = new URL(url);
    oUrl.search = ''
    oUrl.hash = ''

    return oUrl.toString();
  // eslint-disable-next-line no-unused-vars
  } catch (e) {
    return url
  }
}

export async function removeFromUrlHashAndSearchParamsInActiveTab() {
  logCU('removeFromUrlHashAndSearchParamsInActiveTab () 00')
  const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  const [activeTab] = tabs;

  if (activeTab?.id && activeTab?.url) {
    const cleanUrl = removeHashAndSearchParams(activeTab.url);
    logCU('removeFromUrlHashAndSearchParamsInActiveTab () 22 cleanUrl', cleanUrl)

    if (activeTab.url !== cleanUrl) {
      await changeUrlInTab({ tabId: activeTab.id, url: cleanUrl })
    }
  }
}
