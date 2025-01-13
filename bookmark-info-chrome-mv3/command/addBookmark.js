import { findOrCreateFolder } from '../folder-api/index.js'
import { createBookmark } from '../api/bookmark.api.js'
import { page } from '../api/page.api.js'

export async function addBookmarkFromRecentTag({ url, title, parentId }) {
  const result = await createBookmark({
    parentId,
    title,
    url,
  })

  return !!result
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
  const result = await createBookmark({
    parentId: folder.id,
    title,
    url,
  })

  return !!result
}
