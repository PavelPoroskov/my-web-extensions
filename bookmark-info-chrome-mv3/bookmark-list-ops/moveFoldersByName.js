import {
  isDatedFolderTitle,
  moveFolderIgnoreInController,
} from '../folder-api/index.js';
import {
  makeLogFunction,
} from '../api-low/index.js';

const logMF = makeLogFunction({ module: 'moveFoldersByName.js' })

export async function moveFoldersByName({ fromId, toId, isCondition }) {
  logMF('moveFoldersByName () 00')
  const childrenList = await chrome.bookmarks.getChildren(fromId)
  let moveList = childrenList
    .filter(({ url }) => !url)

  if (isCondition) {
    moveList = moveList.filter(({ title }) => isCondition(title))
  }
  logMF('moveFoldersByName () 11', moveList)

  await moveList.reduce(
    (promiseChain, node) => promiseChain.then(
      () => moveFolderIgnoreInController({ id: node.id, parentId: toId })
    ),
    Promise.resolve(),
  );
}

export async function moveOldDatedFolders({ fromId, toId }) {
  const childrenList = await chrome.bookmarks.getChildren(fromId)

  const datedFolderList = childrenList
    .filter(({ url, title }) => !url && isDatedFolderTitle(title))
    .map(({ title, id }) => {
      const partList = title.split(' ')
      const fixedPart = partList.slice(0, -3).join(' ')

      return { title, id, fixedPart }
    })

  const grouped = Object.groupBy(datedFolderList, ({ fixedPart }) => fixedPart);

  const groupedMoveList = []
  Object.entries(grouped).forEach(([, list]) => {
    const moveListForFixedPart = list
      .toSorted((a,b) => a.title.localeCompare(b.title))
      .slice(3)

    groupedMoveList.push(moveListForFixedPart)
  })
  const moveList = groupedMoveList.flat()

  await moveList.reduce(
    (promiseChain, node) => promiseChain.then(
      () => moveFolderIgnoreInController({ id: node.id, parentId: toId })
    ),
    Promise.resolve(),
  );
}