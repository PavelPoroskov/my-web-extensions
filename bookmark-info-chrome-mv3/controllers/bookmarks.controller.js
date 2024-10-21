import {
  log,
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
  IS_BROWSER_FIREFOX,
} from '../constant/index.js'
import {
  extensionSettings,
  memo,
  tagList,
} from '../api/structure/index.js'
import {
  getUnclassifiedFolderId,
} from '../api/special-folder.api.js'

export const bookmarksController = {
  async onCreated(bookmarkId, node) {
    log('bookmark.onCreated <-', node);
    const settings = await extensionSettings.get()

    if (node.url) {
      if (settings[STORAGE_KEY.ADD_BOOKMARK_IS_ON]) {
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
    log('bookmark.onChanged 00 <-', changeInfo);
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
    log('bookmark.onMoved <-', { oldIndex, index, oldParentId, parentId });
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

        let isReplaceMoveToCreate = false

        if (IS_BROWSER_CHROME) {
          isReplaceMoveToCreate = !memo.isActiveTabBookmarkManager
        } else if (IS_BROWSER_FIREFOX) {
          const childrenList = await chrome.bookmarks.getChildren(parentId)
          const lastIndex = childrenList.length - 1

          // isReplaceMoveToCreate = index == lastIndex && settings[STORAGE_KEY.ADD_BOOKMARK_LIST_SHOW] 
          isReplaceMoveToCreate = index == lastIndex
        }

        const unclassifiedFolderId = await getUnclassifiedFolderId()
        isReplaceMoveToCreate = isReplaceMoveToCreate && parentId !== unclassifiedFolderId

        if (isReplaceMoveToCreate) {
          log('bookmark.onMoved 22');

          const { url, title } = node
          await chrome.bookmarks.remove(bookmarkId)
          await chrome.bookmarks.create({
            parentId: oldParentId,
            title,
            url
          })
          await chrome.bookmarks.create({
            parentId,
            title,
            url
          })

          return
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
    log('bookmark.onRemoved <-');
    const settings = await extensionSettings.get()

    if (!node.url) {
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