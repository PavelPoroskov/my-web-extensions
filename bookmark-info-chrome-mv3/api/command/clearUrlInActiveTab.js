import {
  CONTENT_SCRIPT_COMMAND_ID,
} from '../../constant/index.js'
import {
  removeAnchorAndSearchParams,
} from '../url.api.js'
import {
  makeLogFunction,
} from '../log-api.js'

const logCU = makeLogFunction({ module: 'clearUrlInActiveTab' })

export async function changeUrlInTab({ tabId, url }) {
  const msg = {
    command: CONTENT_SCRIPT_COMMAND_ID.CHANGE_URL,
    url,
  }
  logCU('clearUrlInTab () sendMessage', tabId, msg)
  await chrome.tabs.sendMessage(tabId, msg)
    .catch((err) => {
      logCU('clearUrlInTab () IGNORE', err)
    })
}

export async function removeFromUrlAnchorAndSearchParamsInActiveTab() {
  const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  const [activeTab] = tabs;

  if (activeTab?.id && activeTab?.url) {
    const cleanUrl = removeAnchorAndSearchParams(activeTab.url);

    if (activeTab.url !== cleanUrl) {
      await changeUrlInTab({ tabId: activeTab.id, url: cleanUrl })
    }
  }
}