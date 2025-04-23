import {
  createBookmarkFolderById,
  createBookmarkFolderByName,
} from '../bookmark-controller-api/index.js'
import { page } from '../api-mid/index.js'

export async function addBookmarkFromRecentTag({ url, title, parentId }) {
  await createBookmarkFolderById({
    parentId,
    title,
    url,
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

export async function addBookmarkFolderByName({ url, title, folderNameList }) {
  const list = folderNameList.filter((name) => !(40 < name.length))

  if (list.length == 0) {
    return false
  }

  await createBookmarkFolderByName({ url, title, folderNameList: list })
}
