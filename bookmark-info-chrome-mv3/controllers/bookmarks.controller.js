import {
  getUnclassifiedFolderId,
} from '../folder-api/index.js'
import {
  memo,
  tagList,
} from '../data-structures/index.js'
import {
  debouncedUpdateActiveTab,
} from '../api/tabs.api.js'
import {
  createBookmarkIgnoreInController,
  isBookmarkCreatedWithApi,
  moveBookmarkIgnoreInController,
} from '../api/bookmark.api.js'
import {
  IS_BROWSER_CHROME,
  IS_BROWSER_FIREFOX,
} from '../constant/index.js'
import {
  ignoreBkmControllerApiActionSet,
  makeLogFunction,
} from '../api-low/index.js'

const logBC = makeLogFunction({ module: 'bookmarks.controller' })

let lastCreatedBkmId
let lastCreatedBkmTabId
let lastMovedBkmId

export const bookmarksController = {
  async onCreated(bookmarkId, node) {
    if (ignoreBkmControllerApiActionSet.hasIgnoreCreate(node)) {
      logBC('bookmark.onCreated ignore', node);
      return
    }

    lastCreatedBkmId = bookmarkId
    lastCreatedBkmTabId = memo.activeTabId
    logBC('bookmark.onCreated <-', node);

    if (node.url) {
      if (node.index !== 0) {
        await moveBookmarkIgnoreInController({ id: bookmarkId, index: 0 })
      }

      await tagList.addRecentTagFromBkm(node)
    } else {
      await tagList.addRecentTagFromFolder(node)
    }

    // changes in active tab
    debouncedUpdateActiveTab({
      debugCaller: 'bookmark.onCreated'
    });
  },
  async onChanged(bookmarkId, changeInfo) {
    if (ignoreBkmControllerApiActionSet.hasIgnoreUpdate(bookmarkId)) {
      logBC('bookmark.onChanged ignore', bookmarkId);
      return
    }
    logBC('bookmark.onChanged 00 <-', changeInfo);

    if (changeInfo.title) {
      const [node] = await chrome.bookmarks.get(bookmarkId)

      if (!node.url) {
        memo.bkmFolderById.delete(bookmarkId);
        await tagList.addRecentTagFromFolder(node)
      }
    }

    // changes in active tab
    debouncedUpdateActiveTab({
      debugCaller: 'bookmark.onChanged'
    });
  },
  async onMoved(bookmarkId, { oldIndex, index, oldParentId, parentId }) {
    if (ignoreBkmControllerApiActionSet.hasIgnoreMove(bookmarkId)) {
      logBC('bookmark.onMoved ignore', bookmarkId);
      return
    }

    logBC('bookmark.onMoved <-', { oldIndex, index, oldParentId, parentId });
    const [node] = await chrome.bookmarks.get(bookmarkId)

    if (node.url) {
      if (parentId !== oldParentId) {
        await tagList.addRecentTagFromBkm(node);

        const isBookmarkWasCreatedManually = (
          bookmarkId == lastCreatedBkmId
          && memo.activeTabId == lastCreatedBkmTabId
          && !isBookmarkCreatedWithApi({ parentId: oldParentId, url: node.url })
        )

        if (isBookmarkWasCreatedManually) {
          const bookmarkList = await chrome.bookmarks.search({ url: node.url });
          const isFirstBookmark = bookmarkList.length == 1
          const isMoveOnly = isBookmarkWasCreatedManually && isFirstBookmark && lastMovedBkmId != bookmarkId

          if (isMoveOnly) {
            if (index !== 0) {
              await moveBookmarkIgnoreInController({ id: bookmarkId, index: 0 })
            }
          } else {
            let isReplaceMoveToCreate = false

            if (IS_BROWSER_CHROME) {
              const isChromeBookmarkManagerTabActive = !!memo.activeTabUrl && memo.activeTabUrl.startsWith('chrome://bookmarks');
              isReplaceMoveToCreate = !isChromeBookmarkManagerTabActive
            } else if (IS_BROWSER_FIREFOX) {
              const childrenList = await chrome.bookmarks.getChildren(parentId)
              const lastIndex = childrenList.length - 1
                // isReplaceMoveToCreate = index == lastIndex && settings[INTERNAL_VALUES.TAG_LIST_IS_OPEN]
              isReplaceMoveToCreate = index == lastIndex
            }

            const unclassifiedFolderId = await getUnclassifiedFolderId()
            isReplaceMoveToCreate = isReplaceMoveToCreate && parentId !== unclassifiedFolderId

            if (isReplaceMoveToCreate) {
              logBC('bookmark.onMoved 22');
              await moveBookmarkIgnoreInController({ id: bookmarkId, parentId: oldParentId, index: oldIndex })

              const { url, title } = node
              const newBkm = {
                parentId,
                title,
                url,
                index: 0,
              }
              await createBookmarkIgnoreInController(newBkm)
            }
          }
        }

        lastMovedBkmId = bookmarkId
        debouncedUpdateActiveTab({
          debugCaller: 'bookmark.onMoved'
        });
      }
    } else {
      memo.bkmFolderById.delete(bookmarkId);
    }
  },
  async onRemoved(bookmarkId, { node }) {
    if (ignoreBkmControllerApiActionSet.hasIgnoreRemove(bookmarkId)) {
      logBC('bookmark.onRemoved ignore', bookmarkId);
      return
    }

    logBC('bookmark.onRemoved <-', bookmarkId);

    if (!node.url) {
      memo.bkmFolderById.delete(bookmarkId);
      await tagList.removeTag(bookmarkId)
    }

    // changes in active tab
    debouncedUpdateActiveTab({
      debugCaller: 'bookmark.onRemoved'
    });
  },
}
