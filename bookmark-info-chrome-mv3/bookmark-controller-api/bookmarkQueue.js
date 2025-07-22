import {
  memo,
  tagList,
} from '../api-mid/index.js'
import {
  makeLogFunction,
} from '../api-low/index.js'
import {
  updateActiveTab,
} from '../api/index.js'
import {
  moveBookmarkIgnoreInController,
} from './bookmark-ignore.js'
import {
  afterUserCreatedBookmarkInGUI,
  createBookmark,
  isBookmarkCreatedWithApi,
} from './bookmark-create.js'
import {
  IS_BROWSER_CHROME,
  IS_BROWSER_FIREFOX,
} from '../constant/index.js'
import {
  NODE_ACTION,
  NodeTaskQueue,
} from './nodeTaskQueue.js'
import {
  folderCreator,
} from './folderCreator.js'
import {
  isDatedFolderTemplate,
  isDatedFolderTitle,
} from '../folder-api/index.js';

const logBQ = makeLogFunction({ module: 'bookmarkQueue.js' })

let lastCreatedBkmId
let lastCreatedBkmTabId
let lastMovedBkmId


async function onCreateBookmark(task) {
  const { bookmarkId, node } = task
  logBQ('onCreateBookmark () 00', node)

  lastCreatedBkmId = bookmarkId
  lastCreatedBkmTabId = memo.activeTabId

  await afterUserCreatedBookmarkInGUI(node)
}

async function onMoveBookmark(task) {
  const { bookmarkId, node, moveInfo } = task
  const { oldIndex, index, oldParentId, parentId } = moveInfo
  const { url, title } = node

  const isBookmarkWasCreatedManually = (
    bookmarkId == lastCreatedBkmId
    && memo.activeTabId == lastCreatedBkmTabId
    && !isBookmarkCreatedWithApi({ parentId: oldParentId, url: node.url })
  )

  const bookmarkList = await chrome.bookmarks.search({ url: node.url });
  const isFirstBookmark = bookmarkList.length == 1
  const isMoveOnly = isBookmarkWasCreatedManually && isFirstBookmark && lastMovedBkmId != bookmarkId

  if (isMoveOnly) {
    await afterUserCreatedBookmarkInGUI(node)
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

    const unclassifiedFolderId = await folderCreator.findUnclassified()
    isReplaceMoveToCreate = isReplaceMoveToCreate && parentId !== unclassifiedFolderId

    if (isReplaceMoveToCreate) {
      await moveBookmarkIgnoreInController({ id: bookmarkId, parentId: oldParentId, index: oldIndex })
      await createBookmark({ parentId, url, title })
    }
  }

  lastMovedBkmId = bookmarkId
}

async function onDeleteBookmark(task) {
  // logBQ('onDeleteBookmark 00')
  const { parentId } = task
  // logBQ('onDeleteBookmark 11', parentId)
  const [parentNode] = await chrome.bookmarks.get(parentId)
  const parentTitle = parentNode.title

  if (isDatedFolderTemplate(parentTitle) || isDatedFolderTitle(parentTitle)) {
    return
  }

  // logBQ('onDeleteBookmark 22', parentId, parentTitle)
  await tagList.addTag({ parentId, parentTitle })
}

async function bookmarkQueueRunner(task) {
  // logBQ('bookmarkQueueRunner 00', task)
  let isCallUpdateActiveTab = true

  switch (task.action) {
    case NODE_ACTION.CREATE: {
      await onCreateBookmark(task)
      break
    }
    case NODE_ACTION.MOVE: {
      const { moveInfo } = task
      const { oldParentId, parentId } = moveInfo
      isCallUpdateActiveTab = (parentId !== oldParentId)

      if (parentId !== oldParentId) {
        await onMoveBookmark(task)
      }

      break
    }
    case NODE_ACTION.CHANGE: {
      break
    }
    case NODE_ACTION.DELETE: {
      // logBQ('bookmarkQueueRunner 00', task)
      await onDeleteBookmark(task)
      break
    }
  }

  if (isCallUpdateActiveTab) {
    updateActiveTab({
      debugCaller: `bookmarks.on ${task.action}`
    });
  }
}

export const bookmarkQueue = new NodeTaskQueue(bookmarkQueueRunner)
