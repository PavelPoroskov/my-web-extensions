import {
  ignoreBkmControllerApiActionSet,
} from '../bookmark-controller-api/ignoreBkmControllerApiActionSet.js'
import {
  bookmarkQueue,
  folderQueue,
} from '../bookmark-controller-api/index.js'

export const bookmarksController = {
  async onCreated(bookmarkId, node) {
    if (ignoreBkmControllerApiActionSet.hasIgnoreCreate(node)) {
      return
    }

    if (node.url) {
      bookmarkQueue.enqueueCreate({ bookmarkId, node })
    } else {
      folderQueue.enqueueCreate({ bookmarkId, node })
    }
  },
  async onMoved(bookmarkId, moveInfo) {
    if (ignoreBkmControllerApiActionSet.hasIgnoreMove(bookmarkId)) {
      return
    }

    const [node] = await chrome.bookmarks.get(bookmarkId)
    if (node.url) {
      bookmarkQueue.enqueueMove({ bookmarkId, node, moveInfo })
    } else {
      folderQueue.enqueueMove({ bookmarkId, node, moveInfo })
    }
  },
  async onChanged(bookmarkId, changeInfo) {
    if (ignoreBkmControllerApiActionSet.hasIgnoreUpdate(bookmarkId)) {
      return
    }

    const [node] = await chrome.bookmarks.get(bookmarkId)

    if (node.url) {
      bookmarkQueue.enqueueChange({ bookmarkId, node, changeInfo })
    } else {
      folderQueue.enqueueChange({ bookmarkId, node, changeInfo })
    }
  },
  async onRemoved(bookmarkId, { node }) {
    if (ignoreBkmControllerApiActionSet.hasIgnoreRemove(bookmarkId)) {
      return
    }

    if (node.url) {
      bookmarkQueue.enqueueDelete({ bookmarkId, node })
    } else {
      folderQueue.enqueueDelete({ bookmarkId, node })
    }
  },
}
