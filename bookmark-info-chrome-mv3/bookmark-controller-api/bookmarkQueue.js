import {
  memo,
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
  datedTemplate,
} from './datedTemplate.js'

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

    const unclassifiedFolderId = await datedTemplate.findUnclassified()
    isReplaceMoveToCreate = isReplaceMoveToCreate && parentId !== unclassifiedFolderId

    if (isReplaceMoveToCreate) {
      await moveBookmarkIgnoreInController({ id: bookmarkId, parentId: oldParentId, index: oldIndex })
      await createBookmark({ parentId, url, title })
    }
  }

  lastMovedBkmId = bookmarkId
}

async function bookmarkQueueRunner(task) {
  let isCallUpdateActiveTab = false

  switch (task.action) {
    case NODE_ACTION.CREATE: {
      await onCreateBookmark(task)
      isCallUpdateActiveTab = true
      break
    }
    case NODE_ACTION.MOVE: {
      const { moveInfo } = task
      const { oldParentId, parentId } = moveInfo

      if (parentId !== oldParentId) {
        await onMoveBookmark(task)
        isCallUpdateActiveTab = true
      }

      break
    }
    case NODE_ACTION.CHANGE: {
      isCallUpdateActiveTab = true
      break
    }
    case NODE_ACTION.DELETE: {
      isCallUpdateActiveTab = true
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
