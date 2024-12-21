import {
  CONTENT_SCRIPT_MSG_ID,
} from '../constant/index.js'
import {
  removeQueryParamsIfTarget,
} from './url.api.js'
import {
  extensionSettings,
} from './structure/index.js'
import {
  USER_OPTION,
} from './storage.api.config.js'
import {
  makeLogFunction,
} from './log.api.js'

const logCUA = makeLogFunction({ module: 'clear-url.api' })

export async function changeUrlInTab({ tabId, url }) {
  const msg = {
    command: CONTENT_SCRIPT_MSG_ID.CHANGE_URL,
    url,
  }
  logCUA('clearUrlInTab () sendMessage', tabId, msg)
  await chrome.tabs.sendMessage(tabId, msg)
    .catch((err) => {
      logCUA('clearUrlInTab () IGNORE', err)
    })
}

export async function clearUrlOnPageOpen({ tabId, url }) {
  let cleanUrl
  const settings = await extensionSettings.get()

  if (settings[USER_OPTION.CLEAR_URL_ON_PAGE_OPEN]) {
    cleanUrl = removeQueryParamsIfTarget(url);
    
    if (url !== cleanUrl) {
      await changeUrlInTab({ tabId, url: cleanUrl })
    }
  }  

  return cleanUrl || url
}
