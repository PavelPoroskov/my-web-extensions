import {
  isDescriptiveFolderTitle,
} from '../folder-api/index.js'
import {
  moveFolderContentToStart,
  removeFolder,
} from '../bookmark-controller-api/index.js'

export async function moveNotDescriptiveFoldersToUnclassified({ fromId, createToId }) {
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

  const toId = await createToId()

  await folderList.reduce(
    (promiseChain, folderNode) => promiseChain.then(
      () => moveFolderContentToStart(folderNode.id, toId)
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
