import {
  BOOKMARKS_BAR_FOLDER_ID,
  BOOKMARKS_MENU_FOLDER_ID,
  OTHER_BOOKMARKS_FOLDER_ID,
  normalizeTitle,
} from '../folder-api/index.js'
import {
  singular,
} from '../api-low/index.js'
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

function normalizeTitleForMerge (title) {
  // logMRG('normalizeTitleForMerge 00', title)

  const lowNotDashTitle = title.replaceAll('-', '').toLowerCase()
  const partList = lowNotDashTitle.split(' ').filter(Boolean)
  let directiveList = []

  let i = partList.length - 1
  while (-1 < i) {
    const isDirective = partList[i].startsWith('#') || partList[i].startsWith(':')

    if (isDirective) {
      directiveList.push(partList[i])
    } else {
      break
    }

    i = i - 1
  }

  const wordList = partList.slice(0, i+1)
  // logMRG('normalizeTitleForMerge 33', wordList)
  const lastWord = wordList.at(-1)
  const singularLastWord = singular(lastWord)
  const normalizedWordList = wordList.with(-1, singularLastWord)
  const normalizedTitle = normalizedWordList.join(' ')

  return {
    normalizedTitle,
    directiveList,
  }
}

function removeDirectives(title) {
  const partList = title.split(' ').filter(Boolean)

  let i = partList.length - 1
  while (-1 < i) {
    const isDirective = partList[i].startsWith('#') || partList[i].startsWith(':')

    if (!isDirective) {
      break
    }

    i = i - 1
  }

  return partList.slice(0, i+1).join(' ')
}

function addDirectives(title, directiveList) {
  return `${removeDirectives(title)} ${directiveList.toSorted().join(' ')}`
}

async function addSubfolders({ parentId, nameSet }) {
  logMRG('addSubfolders 00', parentId)
  if (!parentId) {
    return
  }

  const nodeList = await chrome.bookmarks.getChildren(parentId)
  const folderNodeList = nodeList.filter(({ url }) => !url)

  for (const node of folderNodeList) {
    const { normalizedTitle, directiveList } = normalizeTitleForMerge(node.title)

    const w10 = directiveList.filter((str) => str.startsWith('#')).length
    const w1 = directiveList.filter((str) => !str.startsWith('#')).length

    const nodeData = Object.assign(
      {},
      node,
      {
        directiveList,
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

    for (const fromNode of restNodeList) {
      moveTaskList.push({
        fromNode,
        toNode: firstNode,
      })
    }

    const allDirectives = sortedList.flatMap(({directiveList}) => directiveList)
    const uniqDirectives = Array.from(new Set(allDirectives))

    if (firstNode.directiveList.length !== uniqDirectives.length) {
      renameTaskList.push({
        id: firstNode.id,
        title: addDirectives(firstNode.title, uniqDirectives),
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
