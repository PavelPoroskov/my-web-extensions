import {
  moveFolderIgnoreInController,
} from '../api/folder.api.js';
import {
  isDatedFolderTitle,
} from '../api/folder-dated.js';


export async function moveFoldersByName({ fromId, toId, isCondition }) {
  const childrenList = await chrome.bookmarks.getChildren(fromId)
  let moveList = childrenList
    .filter(({ url }) => !url)

  if (isCondition) {
    moveList = moveList.filter(({ title }) => isCondition(title))
  }

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
