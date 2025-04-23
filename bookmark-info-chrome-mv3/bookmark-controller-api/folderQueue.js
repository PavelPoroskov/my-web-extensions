import {
  getOptions,
  makeLogFunction,
} from '../api-low/index.js'
import {
  USER_OPTION,
} from '../constant/index.js'
import {
  memo,
  tagList,
} from '../data-structures/index.js'
import {
  debouncedUpdateActiveTab,
} from '../api/index.js'
import {
  BOOKMARKS_BAR_FOLDER_ID,
  BOOKMARKS_MENU_FOLDER_ID,
  OTHER_BOOKMARKS_FOLDER_ID,
  getNewFolderRootId,
} from '../folder-api/index.js'
import {
  NODE_ACTION,
  NodeTaskQueue
} from './nodeTaskQueue.js'
import {
  moveFolderIgnoreInController,
} from './folder-ignore.js'

const logFQ = makeLogFunction({ module: 'folderQueue.js' })

async function onCreateFolder(task) {
  const { node } = task
  const { id, parentId, title } = node
  logFQ('onCreateFolder () 00', title)

  let correctParentId
  const savedObj = await getOptions([
    USER_OPTION.USE_FLAT_FOLDER_STRUCTURE,
  ]);

  if (savedObj[USER_OPTION.USE_FLAT_FOLDER_STRUCTURE]) {
    correctParentId = getNewFolderRootId(title)
  }

  await tagList.addRecentTagFromFolder(node)

  const rootArray = [BOOKMARKS_BAR_FOLDER_ID, BOOKMARKS_MENU_FOLDER_ID, OTHER_BOOKMARKS_FOLDER_ID].filter(Boolean)

  const actualParentId = correctParentId || parentId
  if (rootArray.includes(actualParentId)) {
    const firstLevelNodeList = await chrome.bookmarks.getChildren(actualParentId)
    const findIndex = firstLevelNodeList.find((item) => title.localeCompare(item.title) < 0)

    const moveArgs = {}
    if (correctParentId && parentId != correctParentId) {
      moveArgs.parentId = correctParentId
    }
    if (findIndex) {
      moveArgs.index = findIndex.index
    }

    if (Object.keys(moveArgs).length > 0) {
      moveFolderIgnoreInController({
        id,
        ...moveArgs,
      })
    }
  }

  // changes in active tab
  debouncedUpdateActiveTab({
    debugCaller: 'onCreateFolder'
  });
}

async function onMoveFolder(task) {
  const { bookmarkId } = task
  memo.bkmFolderById.delete(bookmarkId);
}

async function onChangeFolder(task) {
  const { bookmarkId, node } = task

  memo.bkmFolderById.delete(bookmarkId);
  await tagList.addRecentTagFromFolder(node)

  // changes in active tab
  debouncedUpdateActiveTab({
    debugCaller: 'onChangeFolder'
  });
}

async function onDeleteFolder(task) {
  const { bookmarkId } = task

  memo.bkmFolderById.delete(bookmarkId);
  await tagList.removeTag(bookmarkId)

  // changes in active tab
  debouncedUpdateActiveTab({
    debugCaller: 'onDeleteFolder'
  });
}

async function folderQueueRunner(task) {
  switch (task.action) {
    case NODE_ACTION.CREATE: {
      await onCreateFolder(task)
      break
    }
    case NODE_ACTION.MOVE: {
      await onMoveFolder(task)
      break
    }
    case NODE_ACTION.CHANGE: {
      await onChangeFolder(task)
      break
    }
    case NODE_ACTION.DELETE: {
      await onDeleteFolder(task)
      break
    }
  }
}

export const folderQueue = new NodeTaskQueue(folderQueueRunner)
