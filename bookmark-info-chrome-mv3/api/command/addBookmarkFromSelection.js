import { findOrCreateFolder } from '../folder.api.js'
import { addBookmark } from './addBookmark.js'
import { CONTENT_SCRIPT_COMMAND_ID } from '../../constant/index.js'

export async function startAddBookmarkFromSelection() {
  const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  const [activeTab] = tabs;

  if (activeTab?.id) {
      const msg = {
        command: CONTENT_SCRIPT_COMMAND_ID.ADD_BOOKMARK_FROM_SELECTION_PAGE,
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