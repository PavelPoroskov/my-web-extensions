import {
  getDatedTemplate,
  isDatedFolderTitle,
  isServiceDatedTemplate
} from '../folder-api/index.js'
import {
  findOrCreateFolder,
  moveFolderIgnoreInController,
} from '../bookmark-controller-api/index.js'
import {
  makeLogFunction,
} from '../api-low/index.js';

const logMOD = makeLogFunction({ module: 'moveOldDatedFolders.js' })

const KEEP_DATED_FOLDERS = 7

export async function moveOldDatedFolders(fromId) {
  logMOD('moveOldDatedFolders 00')
  const childrenList = await chrome.bookmarks.getChildren(fromId)

  const datedFolderList = childrenList
    .filter(({ url, title }) => !url && isDatedFolderTitle(title))
    .map(({ title, id }) => ({
        id,
        title,
        datedTemplate: getDatedTemplate(title),
    }))

  const grouped = Object.groupBy(datedFolderList, ({ datedTemplate }) => datedTemplate);

  const folderNodeList = await Promise.all(Object.keys(grouped).map(
    (datedTemplate) => findOrCreateFolder(datedTemplate)
  ))
  const mapDatedTemplateToId = Object.fromEntries(
    folderNodeList.map(({ id, title }) => [title, id])
  )

  const groupedMoveList = []
  Object.entries(grouped).forEach(([datedTemplate, list]) => {

    if (isServiceDatedTemplate(datedTemplate)) {
      groupedMoveList.push(list)
    } else {
      const moveListForFixedPart = list
        .toSorted((a,b) => a.title.localeCompare(b.title))
        .slice(KEEP_DATED_FOLDERS)

      groupedMoveList.push(moveListForFixedPart)
    }
  })
  const moveList = groupedMoveList.flat()

  await moveList.reduce(
    (promiseChain, node) => promiseChain.then(
      () => moveFolderIgnoreInController({ id: node.id, parentId: mapDatedTemplateToId[node.datedTemplate] })
    ),
    Promise.resolve(),
  );
}
