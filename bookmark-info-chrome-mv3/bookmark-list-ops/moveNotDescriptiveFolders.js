import {
  getUnclassifiedFolderId,
  isDescriptiveFolderTitle,
  BOOKMARKS_BAR_FOLDER_ID,
  OTHER_BOOKMARKS_FOLDER_ID,
} from '../api/special-folder.api.js';

async function moveContentToStart(fromFolderId, toFolderId) {
  const nodeList = await chrome.bookmarks.getChildren(fromFolderId)
  const reversedNodeList = nodeList.toReversed()

  await Promise.all(reversedNodeList.map(
    ({ id }) => chrome.bookmarks.move(id, { parentId: toFolderId, index: 0 }))
  )
}

async function moveNotDescriptiveFolders({ fromId, unclassifiedId }) {
  const nodeList = await chrome.bookmarks.getChildren(fromId)
  const folderList = nodeList
    .filter(({ url }) => !url)
    .filter(({ title }) => !isDescriptiveFolderTitle(title))

  // await Promise.all(folderList.map(
  //   ({ id }) => moveContent(id, unclassifiedId)
  // ))
  await folderList.reduce(
    (promiseChain, folderNode) => promiseChain.then(() => moveContentToStart(folderNode.id, unclassifiedId)),
    Promise.resolve(),
  );

  await Promise.all(folderList.map(
    ({ id }) => chrome.bookmarks.removeTree(id)
  ))
}

export async function moveNotDescriptiveFoldersToUnclassified() {
  const unclassifiedId = await getUnclassifiedFolderId()

  await moveNotDescriptiveFolders({ fromId: BOOKMARKS_BAR_FOLDER_ID, unclassifiedId })
  await moveNotDescriptiveFolders({ fromId: OTHER_BOOKMARKS_FOLDER_ID, unclassifiedId })
}