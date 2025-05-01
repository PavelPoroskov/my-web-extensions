import {
  memo,
  tagList,
} from '../api-mid/index.js'
import {
  makeLogFunction,
} from '../api-low/index.js'
import {
  getUnclassifiedFolderId,
  isDatedFolderTemplate,
} from '../folder-api/index.js'
import {
  debouncedUpdateActiveTab,
} from '../api/index.js'
import {
  moveBookmarkIgnoreInController,
} from './bookmark-ignore.js'
import {
  createBookmark,
  isBookmarkCreatedWithApi,
} from './bookmark-create.js'
import {
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

const logBQ = makeLogFunction({ module: 'bookmarkQueue.js' })

let lastCreatedBkmId
let lastCreatedBkmTabId
let lastMovedBkmId

var lastCreatedTime
var lastCreatedParentId
const MS_DIFF_FOR_SINGLE_BKM = 80

function isSingleBookmarkCreation(inParentId) {
  let result
  let now = Date.now()

  if (lastCreatedTime) {
    result = (MS_DIFF_FOR_SINGLE_BKM < now - lastCreatedTime) || inParentId != lastCreatedParentId
  } else {
    result = true
  }

  lastCreatedTime = now
  lastCreatedParentId = inParentId

  return result
}

async function onCreateBookmark(task) {
  const { bookmarkId, node } = task
  const { parentId, url } = node
  logBQ('onCreateBookmark () 00', url)

  lastCreatedBkmId = bookmarkId
  lastCreatedBkmTabId = memo.activeTabId

  const [parentNode] = await chrome.bookmarks.get(parentId)
  const isSingle = isSingleBookmarkCreation(parentId)

  if (isDatedFolderTemplate(parentNode.title)) {
    await moveBookmarkInDatedTemplate({
      parentId,
      parentTitle: parentNode.title,
      bookmarkId,
      url,
      isSingle,
    })
  } else {
    if (node.index !== 0 && isSingle) {
      await moveBookmarkIgnoreInController({ id: bookmarkId, index: 0 })
    }

    await tagList.addRecentTagFromBkm(node)
  }
}

async function onMoveBookmark(task) {
  const { bookmarkId, node, moveInfo } = task
  const { oldIndex, index, oldParentId, parentId } = moveInfo
  const { url, title } = node

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
    debouncedUpdateActiveTab({
      debugCaller: `bookmarks.on ${task.action}`
    });
  }
}

export const bookmarkQueue = new NodeTaskQueue(bookmarkQueueRunner)
