import {
  BOOKMARKS_BAR_FOLDER_ID,
  BOOKMARKS_MENU_FOLDER_ID,
  getTitleDetails,
  getTitleWithDirectives,
  isChangesInDirectives,
  normalizeTitle,
  OTHER_BOOKMARKS_FOLDER_ID,
} from '../folder-api/index.js'
import {
  folderCreator,
  moveFolderContentToStart,
  removeFolder,
  updateFolder
} from '../bookmark-controller-api/index.js'
import {
  makeLogFunction,
} from '../api-low/index.js';

const logMRG = makeLogFunction({ module: 'mergeFolders.js' })

async function addSubfolders({ parentId, nameSet }) {
  logMRG('addSubfolders 00', parentId)
  if (!parentId) {
    return
  }

  const nodeList = await chrome.bookmarks.getChildren(parentId)
  const folderNodeList = nodeList.filter(({ url }) => !url)

  for (const node of folderNodeList) {
    const {
      onlyTitle,
      objDirectives,
    } = getTitleDetails(node.title)
    const normalizedTitle = normalizeTitle(onlyTitle)

    const directiveList = Object.keys(objDirectives)
    const w10 = directiveList.filter((str) => str.startsWith('#')).length
    const w1 = directiveList.filter((str) => !str.startsWith('#')).length

    const nodeData = Object.assign(
      {},
      node,
      {
        onlyTitle,
        objDirectives,
        directiveWeight: w10*10 + w1,
      },
    )

    if (!nameSet[normalizedTitle]) {
      nameSet[normalizedTitle] = [nodeData]
    } else {
      nameSet[normalizedTitle].push(nodeData)
    }
  }
}

async function mergeRootSubFolders() {
  logMRG('mergeRootSubFolders 00')

  const nameSet = {}

  await addSubfolders({ parentId: BOOKMARKS_BAR_FOLDER_ID, nameSet })
  await addSubfolders({ parentId: BOOKMARKS_MENU_FOLDER_ID, nameSet })
  await addSubfolders({ parentId: OTHER_BOOKMARKS_FOLDER_ID, nameSet })

  const moveTaskList = []
  const renameTaskList = []
  const notUniqList = Object.entries(nameSet).filter(([, nodeList]) => nodeList.length > 1)

  for (const [, nodeList] of notUniqList) {
    const sortedList = nodeList.toSorted((a, b) => -(a.directiveWeight - b.directiveWeight) || -a.title.localeCompare(b.title))
    const firstNode = sortedList[0]
    const restNodeList = sortedList.slice(1)
    let objAllDirectives = {}

    for (const fromNode of restNodeList) {
      moveTaskList.push({
        fromNode,
        toNode: firstNode,
      })

      objAllDirectives = Object.assign(objAllDirectives, fromNode.objDirectives)
    }

    objAllDirectives = Object.assign(objAllDirectives, firstNode.objDirectives)

    if (isChangesInDirectives({ oldDirectives: firstNode.objDirectives, newDirectives: objAllDirectives })) {
      const newTitle = getTitleWithDirectives({ onlyTitle: firstNode.onlyTitle, objDirectives: objAllDirectives })

      renameTaskList.push({
        id: firstNode.id,
        title: newTitle,
      })
    }
  }

  logMRG('renameTaskList', renameTaskList)
  logMRG('moveTaskList', moveTaskList)

  await renameTaskList.reduce(
    (promiseChain, { id, title }) => promiseChain.then(
      () => updateFolder({ id,  title })
    ),
    Promise.resolve(),
  );

  await moveTaskList.reduce(
    (promiseChain, { fromNode, toNode }) => promiseChain.then(
      () => moveFolderContentToStart(fromNode.id, toNode.id)
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
      () => moveFolderContentToStart(fromNode.id, toNode.id)
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

export async function mergeFolders() {

  await mergeRootSubFolders()

  const datedRootNewId = await folderCreator.findDatedRootNew()
  const datedRootOldId = await folderCreator.findDatedRootOld()
  await mergeSubFoldersLevelOne(datedRootNewId)
  await mergeSubFoldersLevelOne(datedRootOldId)
}
