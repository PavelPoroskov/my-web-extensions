import {
    getUnclassifiedFolderId,
    isDescriptiveFolderTitle,
    OTHER_BOOKMARKS_FOLDER_ID,
  } from '../api/special-folder.api.js';

async function moveContent(fromFolderId, toFolderId) {
    const nodeList = await chrome.bookmarks.getChildren(fromFolderId)
    const reversedNodeList = nodeList.toReversed()
    
    await Promise.all(reversedNodeList.map(
      ({ id }) => chrome.bookmarks.move(id, { parentId: toFolderId, index: 0 }))
    )
  }
  
export async function moveNotDescriptiveFoldersToUnclassified() {
    const unclassifiedId = await getUnclassifiedFolderId()

    const nodeList = await chrome.bookmarks.getChildren(OTHER_BOOKMARKS_FOLDER_ID)
    const folderList = nodeList
      .filter(({ url }) => !url)
      .filter(({ title }) => !isDescriptiveFolderTitle(title))
  
    // await Promise.all(folderList.map(
    //   ({ id }) => moveContent(id, unclassifiedId)
    // ))
    await folderList.reduce(
      (promiseChain, folderNode) => promiseChain.then(() => moveContent(folderNode.id, unclassifiedId)),
      Promise.resolve(),
    );
  
    await Promise.all(folderList.map(
      ({ id }) => chrome.bookmarks.remove(id)
    ))
}