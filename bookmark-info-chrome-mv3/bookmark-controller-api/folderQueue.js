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
  folderCreator,
} from './folderCreator.js'
import {
  NODE_ACTION,
  NodeTaskQueue
} from './nodeTaskQueue.js'
import {
  afterUserCreatedFolderInGUI
} from './folder-gui.js'

const logFQ = makeLogFunction({ module: 'folderQueue.js' })

async function onCreateFolder(task) {
  const { node } = task
  logFQ('onCreateFolder () 00', node.title)

  await tagList.addTag({ parentId: node.id, parentTitle: node.title })
  await afterUserCreatedFolderInGUI(node)
}

async function onMoveFolder(task) {
  const { bookmarkId } = task
  memo.bkmFolderById.delete(bookmarkId);
}

async function onChangeFolder(task) {
  const { bookmarkId, node } = task

  memo.bkmFolderById.delete(bookmarkId);
  await tagList.addTag({ parentId: node.id, parentTitle: node.title })

  folderCreator.clearCache(bookmarkId)
}

async function onDeleteFolder(task) {
  const { bookmarkId } = task

  memo.bkmFolderById.delete(bookmarkId);
  await tagList.removeTag(bookmarkId)

  folderCreator.clearCache(bookmarkId)
}

async function folderQueueRunner(task) {
  let isCallUpdateActiveTab = false

  switch (task.action) {
    case NODE_ACTION.CREATE: {
      await onCreateFolder(task)
      isCallUpdateActiveTab = true
      break
    }
    case NODE_ACTION.MOVE: {
      await onMoveFolder(task)
      break
    }
    case NODE_ACTION.CHANGE: {
      await onChangeFolder(task)
      isCallUpdateActiveTab = true
      break
    }
    case NODE_ACTION.DELETE: {
      await onDeleteFolder(task)
      isCallUpdateActiveTab = true
      break
    }
  }

  if (isCallUpdateActiveTab) {
    updateActiveTab({
      debugCaller: `bookmarks(folders).on ${task.action}`
    });
  }
}

export const folderQueue = new NodeTaskQueue(folderQueueRunner)
