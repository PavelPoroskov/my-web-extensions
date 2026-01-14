import {
  isDatedFolderTitle,
  getDateFromDatedTitle,
} from '../folder-api/index.js'
import {
  folderCreator,
  moveFolderIgnoreInController,
} from '../bookmark-controller-api/index.js'
import {
  makeLogFunction,
} from '../api-low/index.js';

const logMOD = makeLogFunction({ module: 'moveOldDatedFolders.js' })

const KEEP_DATED_FOLDERS = 5

export async function moveOldDatedFolders() {
  const fromId = await folderCreator.findDatedRootNew()

  if (!fromId) {
    return
  }

  logMOD('moveOldDatedFolders 00')
  const childrenList = await chrome.bookmarks.getChildren(fromId)

  const datedFolderList = childrenList
    .filter(({ url, title }) => !url && isDatedFolderTitle(title))
    .map(({ title, id }) => ({
        id,
        title,
        date: getDateFromDatedTitle(title),
    }))

  const groupedObj = Object.groupBy(datedFolderList, ({ date }) => date)

  const moveList = Object.entries(groupedObj)
    .sort(([dateA],[dateB]) => -dateA.localeCompare(dateB))
    .slice(KEEP_DATED_FOLDERS)
    .map(([,list]) => list)
    .flat()

  if (moveList.length == 0) {
    return
  }

  const toId = await folderCreator.findOrCreateDatedRootOld()

  await moveList.reduce(
    (promiseChain, node) => promiseChain.then(
      () => moveFolderIgnoreInController({ id: node.id, parentId: toId })
    ),
    Promise.resolve(),
  );
}
