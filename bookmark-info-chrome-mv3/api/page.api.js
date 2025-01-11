import {
  CONTENT_SCRIPT_MSG_ID,
} from '../constant/index.js'
import {
  makeLogFunction,
} from '../api-low/index.js'

const logCSA = makeLogFunction({ module: 'page.api.js' })

async function changeUrlInTab({ tabId, url }) {
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

async function replaceUrlInTab({ tabId, url }) {
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

async function getSelectionInPage(tabId) {
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

async function getUserInputInPage(tabId) {
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

async function toggleYoutubeHeaderInPage(tabId) {
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

async function updateBookmarkInfoInPage({ tabId, data }) {
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

export const page = {
  changeUrlInTab,
  replaceUrlInTab,
  getSelectionInPage,
  getUserInputInPage,
  toggleYoutubeHeaderInPage,
  updateBookmarkInfoInPage,
}
