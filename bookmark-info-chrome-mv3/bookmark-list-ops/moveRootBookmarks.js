import {
  getUnclassifiedFolderId,
  OTHER_BOOKMARKS_FOLDER_ID,
} from '../api/special-folder.api.js';
import {
  ignoreBkmControllerApiActionSet,
} from '../api/structure/ignoreBkmControllerApiActionSet.js';

async function moveRootBookmarks({ fromId, unclassifiedId }) {
  // console.log('### moveRootBookmarks 00,', fromId)

  // url.startsWith('place:')
  // Firefox: Bookmark toolbar\'Most visited', Bookmark menu\'Recent tags'
  const nodeList = await chrome.bookmarks.getChildren(fromId)
  const bkmList = nodeList
    .filter(({ url }) => url)
    .filter(({ url }) => !url.startsWith('place:'))
  // console.log('### moveRootBookmarks bkmList,', bkmList)

  bkmList.forEach(({ id: bookmarkId }) => {
    ignoreBkmControllerApiActionSet.addIgnoreMove(bookmarkId)
  })

  await bkmList.reduce(
    (promiseChain, bkm) => promiseChain.then(() => chrome.bookmarks.move(bkm.id, { parentId: unclassifiedId })),
    Promise.resolve(),
  );
}

export async function moveRootBookmarksToUnclassified() {
  const unclassifiedId = await getUnclassifiedFolderId()

  // await moveRootBookmarks({ fromId: BOOKMARKS_BAR_FOLDER_ID, unclassifiedId })
  // await moveRootBookmarks({ fromId: BOOKMARKS_MENU_FOLDER_ID, unclassifiedId })
  await moveRootBookmarks({ fromId: OTHER_BOOKMARKS_FOLDER_ID, unclassifiedId })
}
