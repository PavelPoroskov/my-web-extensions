import {
  getUnclassifiedFolderId,
  BOOKMARKS_BAR_FOLDER_ID,
  OTHER_BOOKMARKS_FOLDER_ID,
} from '../api/special-folder.api.js';

async function moveRootBookmarks({ fromId, unclassifiedId }) {
  const nodeList = await chrome.bookmarks.getChildren(fromId)
  const bkmList = nodeList
    .filter(({ url }) => url)

  await Promise.all(bkmList.map(
    (id) => chrome.bookmarks.move(id, { parentId: unclassifiedId })
  ))    
}

export async function moveRootBookmarksToUnclassified() {
  const unclassifiedId = await getUnclassifiedFolderId()

  await moveRootBookmarks({ fromId: BOOKMARKS_BAR_FOLDER_ID, unclassifiedId })
  await moveRootBookmarks({ fromId: OTHER_BOOKMARKS_FOLDER_ID, unclassifiedId })
}