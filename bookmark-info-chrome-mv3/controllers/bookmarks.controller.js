import {
  getUnclassifiedFolderId,
} from '../api/special-folder.api.js'
import {
  extensionSettings,
  memo,
  tagList,
  ignoreBkmControllerApiActionSet,
} from '../api/structure/index.js'
import {
  debouncedUpdateActiveTab,
} from '../api/tabs-api.js'
import {
  IS_BROWSER_CHROME,
  IS_BROWSER_FIREFOX,
  STORAGE_KEY,
} from '../constant/index.js'
import {
  makeLogFunction,
} from '../api/log.api.js'

const logBC = makeLogFunction({ module: 'bookmarks.controller' })

export const bookmarksController = {
  async onCreated(bookmarkId, node) {
    if (ignoreBkmControllerApiActionSet.hasIgnoreCreate(node)) {
      logBC('bookmark.onCreated ignore', node);
      return
    }

    logBC('bookmark.onCreated <-', node);
    const settings = await extensionSettings.get()

    if (node.url) {
      if (node.index !== 0) {
        ignoreBkmControllerApiActionSet.addIgnoreMove(bookmarkId)
        await chrome.bookmarks.move(bookmarkId, { index: 0 })
      }

      if (settings[STORAGE_KEY.ADD_BOOKMARK_IS_ON]) {
        await tagList.addRecentTagFromBkm(node)
      }
    } else {
      if (settings[STORAGE_KEY.ADD_BOOKMARK_IS_ON]) {
        await tagList.addRecentTagFromFolder(node)
      }
    }

    // changes in active tab
    debouncedUpdateActiveTab({
      debugCaller: 'bookmark.onCreated'
    });
  },
  async onChanged(bookmarkId, changeInfo) {
    logBC('bookmark.onChanged 00 <-', changeInfo);
    const settings = await extensionSettings.get()

    const [node] = await chrome.bookmarks.get(bookmarkId)

    // eslint-disable-next-line no-empty
    if (node.url) {
      
    } else {
      memo.bkmFolderById.delete(bookmarkId);

      if (settings[STORAGE_KEY.ADD_BOOKMARK_IS_ON] && changeInfo.title) {
        // await tagList.updateTag(bookmarkId, changeInfo.title)
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
    const settings = await extensionSettings.get()
    // switch (true) {
    //   // in bookmark manager. no changes for this extension
    //   case parentId === oldParentId: {
    //     break
    //   }
    //   // in bookmark manager.
    //   case index < lastIndex: {
    //     getBookmarkInfoUni({ url: node.url });
    //     break
    //   }
    //   // parentId !== oldParentId && index == lastIndex
    //   // in bookmark manager OR in active tab
    //   default: {

    //   }
    // }
    const [node] = await chrome.bookmarks.get(bookmarkId)
    
    if (node.url) {
      if (parentId !== oldParentId) {
        if (settings[STORAGE_KEY.ADD_BOOKMARK_IS_ON]) {
          await tagList.addRecentTagFromBkm(node);

          let isReplaceMoveToCreate = false

          if (IS_BROWSER_CHROME) {
            const isChromeBookmarkManagerTabActive = !!memo.activeTabUrl && memo.activeTabUrl.startsWith('chrome://bookmarks');
            isReplaceMoveToCreate = !isChromeBookmarkManagerTabActive
          } else if (IS_BROWSER_FIREFOX) {
            const childrenList = await chrome.bookmarks.getChildren(parentId)
            const lastIndex = childrenList.length - 1

            // isReplaceMoveToCreate = index == lastIndex && settings[STORAGE_KEY.ADD_BOOKMARK_LIST_SHOW] 
            isReplaceMoveToCreate = index == lastIndex
          }

          const unclassifiedFolderId = await getUnclassifiedFolderId()
          isReplaceMoveToCreate = isReplaceMoveToCreate && parentId !== unclassifiedFolderId

          if (isReplaceMoveToCreate) {
            logBC('bookmark.onMoved 22');

            const { url, title } = node
            ignoreBkmControllerApiActionSet.addIgnoreRemove(bookmarkId)
            await chrome.bookmarks.remove(bookmarkId)
            const oldBkm = {
              parentId: oldParentId,
              title,
              url,
              index: oldIndex,
            }
            const newBkm = {
              parentId,
              title,
              url,
              index: 0,
            }
            ignoreBkmControllerApiActionSet.addIgnoreCreate(oldBkm)
            ignoreBkmControllerApiActionSet.addIgnoreCreate(newBkm)
            await chrome.bookmarks.create(oldBkm)
            await chrome.bookmarks.create(newBkm)
          }
        }

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
    const settings = await extensionSettings.get()

    if (!node.url) {
      memo.bkmFolderById.delete(bookmarkId);

      if (settings[STORAGE_KEY.ADD_BOOKMARK_IS_ON]) {
        await tagList.removeTag(bookmarkId)
      }
    }

    // changes in active tab
    debouncedUpdateActiveTab({
      debugCaller: 'bookmark.onRemoved'
    });
  },
}