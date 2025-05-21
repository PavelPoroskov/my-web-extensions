import {
  isDatedFolderTitle,
} from '../folder-api/index.js'
import {
  datedTemplate,
  moveFolderIgnoreInController,
} from '../bookmark-controller-api/index.js'
import {
  makeLogFunction,
} from '../api-low/index.js';

const logMOD = makeLogFunction({ module: 'moveOldDatedFolders.js' })

const KEEP_DATED_FOLDERS = 3

export async function moveOldDatedFolders() {
  const fromId = await datedTemplate.findDatedRootNew()

  if (!fromId) {
    return
  }

  logMOD('moveOldDatedFolders 00')
  const childrenList = await chrome.bookmarks.getChildren(fromId)

  const getDate = (str) => {
    const partList = str.split(' ')
    return partList.at(-2)
  }
  const datedFolderList = childrenList
    .filter(({ url, title }) => !url && isDatedFolderTitle(title))
    .map(({ title, id }) => ({
        id,
        title,
        date: getDate(title),
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

  const toId = await datedTemplate.findOrCreateDatedRootOld()

  await moveList.reduce(
    (promiseChain, node) => promiseChain.then(
      () => moveFolderIgnoreInController({ id: node.id, parentId: toId })
    ),
    Promise.resolve(),
  );
}
