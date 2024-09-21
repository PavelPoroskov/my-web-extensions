import {
  logEvent,
  logDebug,
} from '../api/log-api.js'

import {
  getBookmarkInfoUni,
} from '../api/bookmarks-api.js'
import {
  updateActiveTab,
} from '../api/tabs-api.js'
import {
  STORAGE_KEY,
  IS_BROWSER_CHROME,
  // eslint-disable-next-line no-unused-vars
  IS_BROWSER_FIREFOX,
} from '../constant/index.js'
import {
  activeDialog,
  extensionSettings,
  memo,
  tagList,
} from '../api/structure/index.js'
import {
  getUnclassifiedFolderId,
} from '../api/special-folder.api.js'

export const bookmarksController = {
  async onCreated(bookmarkId, node) {
    logEvent('bookmark.onCreated <-', node);
    const settings = await extensionSettings.get()

    if (node.url) {
      if (settings[STORAGE_KEY.ADD_BOOKMARK_IS_ON]) {
        activeDialog.createBkmStandard(node.id, node.parentId)
        await tagList.addRecentTagFromBkm(node)
      }
    } else {
      if (settings[STORAGE_KEY.ADD_BOOKMARK_IS_ON]) {
        await tagList.addRecentTagFromFolder(node)
      }
    }

    // changes in active tab
    await updateActiveTab({
      debugCaller: 'bookmark.onCreated'
    });
    // changes in bookmark manager
    getBookmarkInfoUni({ url: node.url });
  },
  async onChanged(bookmarkId, changeInfo) {
    logEvent('bookmark.onChanged 00 <-', changeInfo);
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
    await updateActiveTab({
      debugCaller: 'bookmark.onChanged'
    });
    // changes in bookmark manager
    getBookmarkInfoUni({ url: node.url });   
  },
  async onMoved(bookmarkId, { oldIndex, index, oldParentId, parentId }) {
    logEvent('bookmark.onMoved <-', { oldIndex, index, oldParentId, parentId });
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
      if (settings[STORAGE_KEY.ADD_BOOKMARK_IS_ON] && parentId !== oldParentId) {
        await tagList.addRecentTagFromBkm(node);

        const isCreatedInActiveDialog = activeDialog.isCreatedInActiveDialog(bookmarkId, oldParentId)
        if (isCreatedInActiveDialog) {
          logDebug('bookmark.onMoved 11');
          activeDialog.removeBkm(oldParentId)
        }

        if (!isCreatedInActiveDialog) {
          if (IS_BROWSER_CHROME) {
            const unclassifiedFolderId = await getUnclassifiedFolderId()
            if (!memo.isActiveTabBookmarkManager && parentId != unclassifiedFolderId) {
              logDebug('bookmark.onMoved 22');
              await Promise.all([
                chrome.bookmarks.create({
                  parentId: oldParentId,
                  title: node.title,
                  url: node.url
                }),
                chrome.bookmarks.remove(bookmarkId),
              ])
              await chrome.bookmarks.create({
                parentId,
                title: node.title,
                url: node.url
              })
            }
          // } else if (IS_BROWSER_FIREFOX) {
            
          }
        }
      }
    } else {
      memo.bkmFolderById.delete(bookmarkId);
    }

    await updateActiveTab({
      debugCaller: 'bookmark.onMoved'
    });
    // changes in bookmark manager
    getBookmarkInfoUni({ url: node.url })
  },
  async onRemoved(bookmarkId, { node }) {
    logEvent('bookmark.onRemoved <-');
    const settings = await extensionSettings.get()

    if (node.url) {
      if (settings[STORAGE_KEY.ADD_BOOKMARK_IS_ON]) {
        activeDialog.removeBkm(node.parentId)    
      }
    } else {
      memo.bkmFolderById.delete(bookmarkId);

      if (settings[STORAGE_KEY.ADD_BOOKMARK_IS_ON]) {
        await tagList.removeTag(bookmarkId)
      }
    }

    // changes in active tab
    await updateActiveTab({
      debugCaller: 'bookmark.onRemoved'
    });

    // changes in bookmark manager
    getBookmarkInfoUni({ url: node?.url });
  },
}