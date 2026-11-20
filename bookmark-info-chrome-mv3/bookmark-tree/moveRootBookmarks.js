import {
  moveBookmarkIgnoreInController,
} from '../bookmark-controller-api/index.js'

export async function moveRootBookmarksToUnclassified({ fromId, createToId }) {
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

  const toId = await createToId()

  await bkmList.reduce(
    (promiseChain, bkm) => promiseChain.then(
      () => moveBookmarkIgnoreInController({ id: bkm.id, parentId: toId })
    ),
    Promise.resolve(),
  );
}
