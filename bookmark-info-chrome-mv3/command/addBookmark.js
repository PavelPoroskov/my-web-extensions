import { findOrCreateFolder } from '../api/find-folder.api.js'
import { createBookmarkWithApi } from '../api/bookmark.api.js'
import {
  getUserInputInPage,
  getSelectionInPage,
} from '../api/content-script.api.js'

export async function addBookmark({ url, title, parentId }) {
  const bookmarkList = await chrome.bookmarks.search({ url });
  const isExist = bookmarkList.some((bkm) => bkm.parentId == parentId)
  if (isExist) {
    return false
  }

  await createBookmarkWithApi({
    index: 0,
    parentId,
    title,
    url
  })

  return true
}

export async function startAddBookmarkFromSelection() {
  const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  const [activeTab] = tabs;

  if (activeTab?.id) {
    await getSelectionInPage(activeTab.id)
  }
}

export async function startAddBookmarkFromInput() {
  const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  const [activeTab] = tabs;

  if (activeTab?.id) {
    await getUserInputInPage(activeTab.id)
  }
}

export async function addBookmarkFolderByName({ url, title, folderName }) {
  if (folderName.length > 40) {
    return false
  }

  const folder = await findOrCreateFolder(folderName)
  return await addBookmark({ url, title, parentId: folder.id })
}
