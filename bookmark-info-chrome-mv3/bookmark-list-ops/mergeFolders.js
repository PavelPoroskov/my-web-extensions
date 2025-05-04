import {
  normalizeTitle,
  trimTitle,
} from '../folder-api/index.js'
import {
  removeFolder,
  updateFolder,
  moveNodeIgnoreInController,
} from '../bookmark-controller-api/index.js'


async function moveContent(fromFolderId, toFolderId) {
  const nodeList = await chrome.bookmarks.getChildren(fromFolderId)

  await nodeList.reduce(
    (promiseChain, node) => promiseChain.then(
      () => moveNodeIgnoreInController({ id: node.id, parentId: toFolderId })
    ),
    Promise.resolve(),
  );
}

async function mergeSubFoldersLevelOne(parentId) {
  if (!parentId) {
    return
  }

  // console.log('### mergeSubFolder 00,', parentId)
  const nodeList = await chrome.bookmarks.getChildren(parentId)
  const folderNodeList = nodeList.filter(({ url }) => !url)
  const nameSet = {}

  for (const node of folderNodeList) {
    const normalizedTitle = normalizeTitle(node.title)

    if (!nameSet[normalizedTitle]) {
      nameSet[normalizedTitle] = [node]
    } else {
      nameSet[normalizedTitle].push(node)
    }
  }
  // console.log('### mergeSubFolder 11: nameSet', nameSet)

  const notUniqList = Object.entries(nameSet).filter(([, nodeList]) => nodeList.length > 1)
  const moveTaskList = []
  for (const [, nodeList] of notUniqList) {
    const sortedList = nodeList.toSorted((a, b) => -a.title.localeCompare(b.title))
    const firstNode = sortedList[0]
    const restNodeList = nodeList.filter((item) => item.id != firstNode.id)

    for (const fromNode of restNodeList) {
      moveTaskList.push({
        fromNode,
        toNode: firstNode,
      })
    }
  }
  // console.log('### moveTaskList', moveTaskList.map(({ fromNode, toNode }) => `${fromNode.title} -> ${toNode.title}`))

  await moveTaskList.reduce(
    (promiseChain, { fromNode, toNode }) => promiseChain.then(
      () => moveContent(fromNode.id, toNode.id)
    ),
    Promise.resolve(),
  );

  await moveTaskList.reduce(
    (promiseChain, { fromNode }) => promiseChain.then(
      () => removeFolder(fromNode.id)
    ),
    Promise.resolve(),
  );
}

export async function mergeSubFoldersLevelOneAndTwo(parentId) {
  if (!parentId) {
    return
  }

  await mergeSubFoldersLevelOne(parentId)

  const mergeLevelTwoList = []
  const [rootNode] = await chrome.bookmarks.getSubTree(parentId)

  for (const node of rootNode.children) {
    if (!node.url) {
      const childrenFolderList = node.children.filter(({ url }) => !url)

      if (2 <= childrenFolderList.length) {
        mergeLevelTwoList.push(node.id)
      }
    }
  }

  await mergeLevelTwoList.reduce(
    (promiseChain, folderLevelOneId) => promiseChain.then(
      () => mergeSubFoldersLevelOne(folderLevelOneId)
    ),
    Promise.resolve(),
  );
}

export async function trimTitleInSubFolders(parentId) {
  if (!parentId) {
    return
  }

  const nodeList = await chrome.bookmarks.getChildren(parentId)
  const folderNodeList = nodeList.filter(({ url }) => !url)

  const renameTaskList = []
  for (const folderNode of folderNodeList) {

    const trimmedTitle = trimTitle(folderNode.title)
    if (folderNode.title !== trimmedTitle) {
      renameTaskList.push({
        id: folderNode.id,
        title: trimmedTitle,
      })
    }
  }

  await renameTaskList.reduce(
    (promiseChain, { id, title }) => promiseChain.then(
      () => updateFolder({ id,  title })
    ),
    Promise.resolve(),
  );
}
