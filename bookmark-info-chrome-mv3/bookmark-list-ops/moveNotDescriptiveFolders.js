import {
  isDescriptiveFolderTitle,
  BOOKMARKS_BAR_FOLDER_ID,
  OTHER_BOOKMARKS_FOLDER_ID,
} from '../folder-api/index.js'
import {
  moveFolderContentToStart,
  removeFolder,
  datedTemplate,
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

  const unclassifiedId = await datedTemplate.findOrCreateUnclassified()

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

  await moveNotDescriptiveFolders({ fromId: BOOKMARKS_BAR_FOLDER_ID })
  await moveNotDescriptiveFolders({ fromId: OTHER_BOOKMARKS_FOLDER_ID })
}
