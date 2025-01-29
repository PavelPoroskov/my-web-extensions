import {
  getUnclassifiedFolderId,
  isDatedFolderTemplate,
} from '../folder-api/index.js'
import {
  memo,
  tagList,
} from '../data-structures/index.js'
import {
  debouncedUpdateActiveTab,
} from '../api/updateTab.js'
import {
  createBookmarkIgnoreInController,
  moveBookmarkIgnoreInController,
} from './bookmark-ignore.js'
import {
  isBookmarkCreatedWithApi,
} from './bookmark-create1.js'
import {
  createBookmarkInDatedTemplate,
  moveBookmarkInDatedTemplate,
} from './bookmark-dated.js'
import {
  IS_BROWSER_CHROME,
  IS_BROWSER_FIREFOX,
} from '../constant/index.js'
import {
  NODE_ACTION,
  NodeTaskQueue,
} from './nodeTaskQueue.js'

let lastCreatedBkmId
let lastCreatedBkmTabId
let lastMovedBkmId

async function onCreateBookmark(task) {
  const { bookmarkId, node } = task
  const { parentId, url } = node

  lastCreatedBkmId = bookmarkId
  lastCreatedBkmTabId = memo.activeTabId

  const [parentNode] = await chrome.bookmarks.get(parentId)

  if (isDatedFolderTemplate(parentNode.title)) {
    await moveBookmarkInDatedTemplate({
      parentId,
      parentTitle: parentNode.title,
      bookmarkId,
      url,
    })
  } else {
    if (node.index !== 0) {
      await moveBookmarkIgnoreInController({ id: bookmarkId, index: 0 })
    }

    await tagList.addRecentTagFromBkm(node)
  }

  // changes in active tab
  debouncedUpdateActiveTab({
    debugCaller: 'onCreateBookmark'
  });
}

async function onMoveBookmark(task) {
  const { bookmarkId, node, moveInfo } = task
  const { oldIndex, index, oldParentId, parentId } = moveInfo
  const { url, title } = node

  if (parentId !== oldParentId) {
    const [parentNode] = await chrome.bookmarks.get(parentId)
    const isDatedTemplate = isDatedFolderTemplate(parentNode.title)

    if (!isDatedTemplate) {
      await tagList.addRecentTagFromBkm(node);
    }

    const isBookmarkWasCreatedManually = (
      bookmarkId == lastCreatedBkmId
      && memo.activeTabId == lastCreatedBkmTabId
      && !isBookmarkCreatedWithApi({ parentId: oldParentId, url: node.url })
    )

    const bookmarkList = await chrome.bookmarks.search({ url: node.url });
    const isFirstBookmark = bookmarkList.length == 1
    const isMoveOnly = isBookmarkWasCreatedManually && isFirstBookmark && lastMovedBkmId != bookmarkId

    if (isMoveOnly) {
      if (isDatedTemplate) {
        await moveBookmarkInDatedTemplate({
          parentId,
          parentTitle: parentNode.title,
          bookmarkId,
          url,
        })
      } else {
        if (index !== 0) {
          await moveBookmarkIgnoreInController({ id: bookmarkId, index: 0 })
        }
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
        isReplaceMoveToCreate = index == lastIndex && url == memo.activeTabUrl
      }

      const unclassifiedFolderId = await getUnclassifiedFolderId()
      isReplaceMoveToCreate = isReplaceMoveToCreate && parentId !== unclassifiedFolderId

      if (isReplaceMoveToCreate) {
        await moveBookmarkIgnoreInController({ id: bookmarkId, parentId: oldParentId, index: oldIndex })

        if (isDatedTemplate) {
          await createBookmarkInDatedTemplate({
            parentId,
            parentTitle: parentNode.title,
            title,
            url,
          })
        } else {
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
      debugCaller: 'onMoveBookmark'
    });
  }
}

// eslint-disable-next-line no-unused-vars
async function onChangeBookmark(task) {
  // changes in active tab
  debouncedUpdateActiveTab({
    debugCaller: 'onChangeBookmark'
  });
}

// eslint-disable-next-line no-unused-vars
async function onDeleteBookmark(task) {
  // changes in active tab
  debouncedUpdateActiveTab({
    debugCaller: 'onDeleteBookmark'
  });
}

async function bookmarkQueueRunner(task) {
  switch (task.action) {
    case NODE_ACTION.CREATE: {
      await onCreateBookmark(task)
      break
    }
    case NODE_ACTION.MOVE: {
      await onMoveBookmark(task)
      break
    }
    case NODE_ACTION.CHANGE: {
      await onChangeBookmark(task)
      break
    }
    case NODE_ACTION.DELETE: {
      await onDeleteBookmark(task)
      break
    }
  }
}

export const bookmarkQueue = new NodeTaskQueue(bookmarkQueueRunner)
