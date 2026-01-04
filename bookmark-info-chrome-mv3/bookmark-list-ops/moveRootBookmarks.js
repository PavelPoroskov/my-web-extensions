import {
  rootFolders,
} from '../folder-api/index.js';
import {
  moveBookmarkIgnoreInController,
  folderCreator,
} from '../bookmark-controller-api/index.js'

async function moveRootBookmarks({ fromId }) {
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

  if (bkmList.length == 0) {
    return
  }

  const unclassifiedId = await folderCreator.findOrCreateUnclassified()

  await bkmList.reduce(
    (promiseChain, bkm) => promiseChain.then(
      () => moveBookmarkIgnoreInController({ id: bkm.id, parentId: unclassifiedId })
    ),
    Promise.resolve(),
  );
}

export async function moveRootBookmarksToUnclassified() {

  // await moveRootBookmarks({ fromId: BOOKMARKS_BAR_FOLDER_ID, unclassifiedId })
  // await moveRootBookmarks({ fromId: BOOKMARKS_MENU_FOLDER_ID, unclassifiedId })
  await moveRootBookmarks({ fromId: rootFolders.OTHER_BOOKMARKS_FOLDER_ID })
}
