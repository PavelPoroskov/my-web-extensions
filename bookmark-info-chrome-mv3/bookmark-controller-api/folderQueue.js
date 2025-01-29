import {
  memo,
  tagList,
} from '../data-structures/index.js'
import {
  debouncedUpdateActiveTab,
} from '../api/updateTab.js'
import {
  BOOKMARKS_BAR_FOLDER_ID,
  BOOKMARKS_MENU_FOLDER_ID,
  OTHER_BOOKMARKS_FOLDER_ID,
} from '../folder-api/index.js'
import {
  NODE_ACTION,
  NodeTaskQueue
} from './nodeTaskQueue.js'
import {
  moveFolderIgnoreInController,
} from './folder-ignore.js'

async function onCreateFolder(task) {
  const { node } = task
  await tagList.addRecentTagFromFolder(node)

  const rootArray = [BOOKMARKS_BAR_FOLDER_ID, BOOKMARKS_MENU_FOLDER_ID, OTHER_BOOKMARKS_FOLDER_ID].filter(Boolean)
  const { id, parentId, title } = node

  if (rootArray.includes(parentId)) {
    const firstLevelNodeList = await chrome.bookmarks.getChildren(parentId)
    const findIndex = firstLevelNodeList.find((item) => title.localeCompare(item.title) < 0)

    if (findIndex) {
      moveFolderIgnoreInController({ id, index: findIndex.index })
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
