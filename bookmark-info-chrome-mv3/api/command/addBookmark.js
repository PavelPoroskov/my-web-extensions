import { findOrCreateFolder } from '../folder.api.js'
import { CONTENT_SCRIPT_MSG_ID } from '../../constant/index.js'

export async function addBookmark({ url, title, parentId }) {
  const bookmarkList = await chrome.bookmarks.search({ url });
  const isExist = bookmarkList.some((bkm) => bkm.parentId == parentId)
  if (isExist) {
    return
  }

  await chrome.bookmarks.create({
    index: 0,
    parentId,
    title,
    url
  })
}

export async function startAddBookmarkFromSelection() {
  const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  const [activeTab] = tabs;

  if (activeTab?.id) {
      const msg = {
        command: CONTENT_SCRIPT_MSG_ID.ADD_BOOKMARK_FROM_SELECTION_PAGE,
      }
      // logCU('addBookmarkFromSelection() sendMessage', activeTab.id, msg)
      await chrome.tabs.sendMessage(activeTab.id, msg)
        // .catch((err) => {
        //   logCU('startAddBookmarkFromSelection() IGNORE', err)
        // })
  }
}

export async function addBookmarkFromSelection({ url, title, selection }) {
  if (selection.length > 40) {
    return
  }

  const folder = await findOrCreateFolder(selection)
  await addBookmark({ url, title, parentId: folder.id })
}

export async function startAddBookmarkFromInput() {
  const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  const [activeTab] = tabs;

  if (activeTab?.id) {
      const msg = {
        command: CONTENT_SCRIPT_MSG_ID.ADD_BOOKMARK_FROM_INPUT_PAGE,
      }
      // logCU('addBookmarkFromSelection() sendMessage', activeTab.id, msg)
      await chrome.tabs.sendMessage(activeTab.id, msg)
        // .catch((err) => {
        //   logCU('startAddBookmarkFromSelection() IGNORE', err)
        // })
  }
}
