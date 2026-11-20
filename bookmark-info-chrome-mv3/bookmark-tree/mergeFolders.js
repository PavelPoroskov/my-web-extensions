import {
  getTitleDetails,
  getTitleWithDirectives,
  isChangesInDirectives,
  normalizeTitle,
  trimTitle,
} from '../folder-api/index.js'
import {
  moveFolderContentToStart,
  removeFolder,
  updateFolder
} from '../bookmark-controller-api/index.js'
import {
  makeLogFunction,
} from '../api-low/index.js'

const logMRG = makeLogFunction({ module: 'mergeFolders.js' })

export async function mergeChildFolders({ parentId }) {
  if (!parentId) {
    return
  }

  const nameSet = {}

  const nodeList = await chrome.bookmarks.getChildren(parentId)
  const folderNodeList = nodeList.filter(({ url }) => !url)

  for (const node of folderNodeList) {
    const {
      onlyTitle,
      objDirectives,
    } = getTitleDetails(node.title)
    const normalizedTitle = normalizeTitle(onlyTitle)

    const nodeData = Object.assign(
      {},
      node,
      {
        onlyTitle,
        objDirectives,
        directiveWeight: Object.keys(objDirectives).length,
      },
    )

    if (!nameSet[normalizedTitle]) {
      nameSet[normalizedTitle] = [nodeData]
    } else {
      nameSet[normalizedTitle].push(nodeData)
    }
  }

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

  const uniqList = Object.entries(nameSet).filter(([, nodeList]) => nodeList.length == 1)
  for (const [, nodeList] of uniqList) {
    const [folder] = nodeList

    const trimmedTitle = trimTitle(folder.title)

    if (folder.title !== trimmedTitle) {
      renameTaskList.push({
        id: folder.id,
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
