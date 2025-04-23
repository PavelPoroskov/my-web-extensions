import {
  CONTENT_SCRIPT_MSG_ID,
} from '../constant/index.js'
import {
  makeLogFunction,
} from '../api-low/index.js'

const logPA = makeLogFunction({ module: 'page.api.js' })

async function changeUrlInTab({ tabId, url }) {
  logPA('changeUrlInTab () 00', tabId, url)
  const msg = {
    command: CONTENT_SCRIPT_MSG_ID.CHANGE_URL,
    url,
  }
  logPA('changeUrlInTab () sendMessage', tabId, msg)
  await chrome.tabs.sendMessage(tabId, msg)
    .catch((err) => {
      logPA('changeUrlInTab () IGNORE', err)
    })
}

async function replaceUrlInTab({ tabId, url }) {
  logPA('replaceUrlInTab () 00', tabId, url)

  const msg = {
    command: CONTENT_SCRIPT_MSG_ID.REPLACE_URL,
    url,
  }
  logPA('changeUrlInTab () sendMessage', tabId, msg)
  await chrome.tabs.sendMessage(tabId, msg)
    .catch((err) => {
      logPA('changeUrlInTab () IGNORE', err)
    })
}

async function getSelectionInPage(tabId) {
  logPA('getSelectionInPage () 00', tabId)
  const msg = {
    command: CONTENT_SCRIPT_MSG_ID.GET_SELECTION,
  }
  logPA('getSelectionInPage () sendMessage', tabId)
  await chrome.tabs.sendMessage(tabId, msg)
    .catch((err) => {
      logPA('getSelectionInPage () IGNORE', err)
    })
}

async function getUserInputInPage(tabId) {
  logPA('getUserInputInPage () 00', tabId)
  const msg = {
    command: CONTENT_SCRIPT_MSG_ID.GET_USER_INPUT,
  }
  logPA('getUserInputInPage () sendMessage', tabId)
  await chrome.tabs.sendMessage(tabId, msg)
    .catch((err) => {
      logPA('getUserInputInPage () IGNORE', err)
    })
}

async function toggleYoutubeHeaderInPage(tabId) {
  logPA('toggleYoutubeHeaderInPage () 00', tabId)
  const msg = {
    command: CONTENT_SCRIPT_MSG_ID.TOGGLE_YOUTUBE_HEADER,
  }
  logPA('toggleYoutubeHeaderInPage () sendMessage', tabId)
  await chrome.tabs.sendMessage(tabId, msg)
    .catch((err) => {
      logPA('toggleYoutubeHeaderInPage () IGNORE', err)
    })
}

async function updateBookmarkInfoInPage({ tabId, data }) {
  logPA('updateBookmarkInfo () 00', tabId)
  const msg = {
    command: CONTENT_SCRIPT_MSG_ID.BOOKMARK_INFO,
    ...data,
  }
  logPA('updateBookmarkInfo () sendMessage', tabId)
  await chrome.tabs.sendMessage(tabId, msg)
    .catch((err) => {
      logPA('updateBookmarkInfo () IGNORE', err)
    })
}

async function sendMeAuthor({ tabId, authorSelector }) {
  if (!authorSelector) {
    return
  }

  logPA('sendMeAuthor () 00', tabId)
  const msg = {
    command: CONTENT_SCRIPT_MSG_ID.SEND_ME_AUTHOR,
    authorSelector,
  }
  logPA('sendMeAuthor () sendMessage', tabId)
  await chrome.tabs.sendMessage(tabId, msg)
    .catch((err) => {
      logPA('sendMeAuthor () IGNORE', err)
    })
}

export const page = {
  changeUrlInTab,
  replaceUrlInTab,
  getSelectionInPage,
  getUserInputInPage,
  toggleYoutubeHeaderInPage,
  updateBookmarkInfoInPage,
  sendMeAuthor,
}
