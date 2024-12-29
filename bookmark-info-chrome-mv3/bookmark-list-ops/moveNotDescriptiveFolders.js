import {
  getUnclassifiedFolderId,
  isDescriptiveFolderTitle,
  BOOKMARKS_BAR_FOLDER_ID,
  OTHER_BOOKMARKS_FOLDER_ID,
} from '../api/special-folder.api.js';
import {
  moveBookmark,
} from '../api/create-bookmark.api.js';

async function moveContentToStart(fromFolderId, toFolderId) {
  const nodeList = await chrome.bookmarks.getChildren(fromFolderId)
  const reversedNodeList = nodeList.toReversed()

  await reversedNodeList.reduce(
    (promiseChain, node) => promiseChain.then(
      () => moveBookmark({ id: node.id, parentId: toFolderId, index: 0 })
    ),
    Promise.resolve(),
  );
}

async function moveNotDescriptiveFolders({ fromId, unclassifiedId }) {
  const nodeList = await chrome.bookmarks.getChildren(fromId)
  const folderList = nodeList
    .filter(({ url }) => !url)
    .filter(({ title }) => !isDescriptiveFolderTitle(title))

  await folderList.reduce(
    (promiseChain, folderNode) => promiseChain.then(
      () => moveContentToStart(folderNode.id, unclassifiedId)
    ),
    Promise.resolve(),
  );

  await folderList.reduce(
    (promiseChain, folderNode) => promiseChain.then(
      () => chrome.bookmarks.remove(folderNode.id)
    ),
    Promise.resolve(),
  );
}

export async function moveNotDescriptiveFoldersToUnclassified() {
  const unclassifiedId = await getUnclassifiedFolderId()

  await moveNotDescriptiveFolders({ fromId: BOOKMARKS_BAR_FOLDER_ID, unclassifiedId })
  await moveNotDescriptiveFolders({ fromId: OTHER_BOOKMARKS_FOLDER_ID, unclassifiedId })
}
