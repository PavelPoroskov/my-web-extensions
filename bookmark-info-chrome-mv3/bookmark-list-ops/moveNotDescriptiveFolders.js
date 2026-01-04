import {
  isDescriptiveFolderTitle,
  rootFolders,
} from '../folder-api/index.js'
import {
  moveFolderContentToStart,
  removeFolder,
  folderCreator,
} from '../bookmark-controller-api/index.js'

async function moveNotDescriptiveFolders({ fromId }) {
  if (!fromId) {
    return
  }

  const nodeList = await chrome.bookmarks.getChildren(fromId)
  const folderList = nodeList
    .filter(({ url }) => !url)
    .filter(({ title }) => !isDescriptiveFolderTitle(title))

  if (folderList.length == 0) {
    return
  }

  const unclassifiedId = await folderCreator.findOrCreateUnclassified()

  await folderList.reduce(
    (promiseChain, folderNode) => promiseChain.then(
      () => moveFolderContentToStart(folderNode.id, unclassifiedId)
    ),
    Promise.resolve(),
  );

  await folderList.reduce(
    (promiseChain, folderNode) => promiseChain.then(
      () => removeFolder(folderNode.id)
    ),
    Promise.resolve(),
  );
}

export async function moveNotDescriptiveFoldersToUnclassified() {

  await moveNotDescriptiveFolders({ fromId: rootFolders.BOOKMARKS_BAR_FOLDER_ID })
  await moveNotDescriptiveFolders({ fromId: rootFolders.OTHER_BOOKMARKS_FOLDER_ID })
}
