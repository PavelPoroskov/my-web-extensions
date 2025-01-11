import { findOrCreateFolder } from '../folder-api/index.js'
import { createBookmarkWithApi } from '../api/bookmark.api.js'
import { page } from '../api/page.api.js'

export async function addBookmark({ url, title, parentId }) {
  return await createBookmarkWithApi({
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
    await page.getSelectionInPage(activeTab.id)
  }
}

export async function startAddBookmarkFromInput() {
  const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  const [activeTab] = tabs;

  if (activeTab?.id) {
    await page.getUserInputInPage(activeTab.id)
  }
}

export async function addBookmarkFolderByName({ url, title, folderName }) {
  if (folderName.length > 40) {
    return false
  }

  const folder = await findOrCreateFolder(folderName)
  return await addBookmark({ url, title, parentId: folder.id })
}
