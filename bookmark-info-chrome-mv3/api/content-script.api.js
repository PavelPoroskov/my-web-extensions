import {
  CONTENT_SCRIPT_MSG_ID,
} from '../constant/index.js'
import {
  makeLogFunction,
} from '../api-low/log.api.js'

const logCSA = makeLogFunction({ module: 'content-script.api' })

export async function changeUrlInTab({ tabId, url }) {
  logCSA('changeUrlInTab () 00', tabId, url)
  const msg = {
    command: CONTENT_SCRIPT_MSG_ID.CHANGE_URL,
    url,
  }
  logCSA('changeUrlInTab () sendMessage', tabId, msg)
  await chrome.tabs.sendMessage(tabId, msg)
    .catch((err) => {
      logCSA('changeUrlInTab () IGNORE', err)
    })
}

export async function replaceUrlInTab({ tabId, url }) {
  logCSA('replaceUrlInTab () 00', tabId, url)

  const msg = {
    command: CONTENT_SCRIPT_MSG_ID.REPLACE_URL,
    url,
  }
  logCSA('changeUrlInTab () sendMessage', tabId, msg)
  await chrome.tabs.sendMessage(tabId, msg)
    .catch((err) => {
      logCSA('changeUrlInTab () IGNORE', err)
    })
}

export async function getSelectionInPage(tabId) {
  logCSA('getSelectionInPage () 00', tabId)
  const msg = {
    command: CONTENT_SCRIPT_MSG_ID.GET_SELECTION,
  }
  logCSA('getSelectionInPage () sendMessage', tabId)
  await chrome.tabs.sendMessage(tabId, msg)
    .catch((err) => {
      logCSA('getSelectionInPage () IGNORE', err)
    })
}

export async function getUserInputInPage(tabId) {
  logCSA('getUserInputInPage () 00', tabId)
  const msg = {
    command: CONTENT_SCRIPT_MSG_ID.GET_USER_INPUT,
  }
  logCSA('getUserInputInPage () sendMessage', tabId)
  await chrome.tabs.sendMessage(tabId, msg)
    .catch((err) => {
      logCSA('getUserInputInPage () IGNORE', err)
    })
}

export async function toggleYoutubeHeaderInPage(tabId) {
  logCSA('toggleYoutubeHeaderInPage () 00', tabId)
  const msg = {
    command: CONTENT_SCRIPT_MSG_ID.TOGGLE_YOUTUBE_HEADER,
  }
  logCSA('toggleYoutubeHeaderInPage () sendMessage', tabId)
  await chrome.tabs.sendMessage(tabId, msg)
    .catch((err) => {
      logCSA('toggleYoutubeHeaderInPage () IGNORE', err)
    })
}

export async function updateBookmarkInfoInPage({ tabId, data }) {
  logCSA('updateBookmarkInfo () 00', tabId)
  const msg = {
    command: CONTENT_SCRIPT_MSG_ID.BOOKMARK_INFO,
    ...data,
  }
  logCSA('updateBookmarkInfo () sendMessage', tabId)
  await chrome.tabs.sendMessage(tabId, msg)
    .catch((err) => {
      logCSA('updateBookmarkInfo () IGNORE', err)
    })
}
