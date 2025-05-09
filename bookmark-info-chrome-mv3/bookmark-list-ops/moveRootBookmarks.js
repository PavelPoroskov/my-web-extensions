import {
  getUnclassifiedFolderId,
  OTHER_BOOKMARKS_FOLDER_ID,
} from '../folder-api/index.js';
import {
  moveBookmarkIgnoreInController,
} from '../bookmark-controller-api/index.js'

async function moveRootBookmarks({ fromId, unclassifiedId }) {
  if (!fromId) {
    return
  }
  // console.log('### moveRootBookmarks 00,', fromId)

  // url.startsWith('place:')
  // Firefox: Bookmark toolbar\'Most visited', Bookmark menu\'Recent tags'
  const nodeList = await chrome.bookmarks.getChildren(fromId)
  const bkmList = nodeList
    .filter(({ url }) => url)
    .filter(({ url }) => !url.startsWith('place:'))
  // console.log('### moveRootBookmarks bkmList,', bkmList)

  await bkmList.reduce(
    (promiseChain, bkm) => promiseChain.then(
      () => moveBookmarkIgnoreInController({ id: bkm.id, parentId: unclassifiedId })
    ),
    Promise.resolve(),
  );
}

export async function moveRootBookmarksToUnclassified() {
  const unclassifiedId = await getUnclassifiedFolderId()

  // await moveRootBookmarks({ fromId: BOOKMARKS_BAR_FOLDER_ID, unclassifiedId })
  // await moveRootBookmarks({ fromId: BOOKMARKS_MENU_FOLDER_ID, unclassifiedId })
  await moveRootBookmarks({ fromId: OTHER_BOOKMARKS_FOLDER_ID, unclassifiedId })
}
