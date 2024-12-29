import {
  BOOKMARKS_BAR_FOLDER_ID,
  OTHER_BOOKMARKS_FOLDER_ID,
} from '../api/special-folder.api.js';
import {
  moveBookmark,
} from '../api/bookmark.api.js';

async function sortChildren(parentId) {
  // console.log('sortChildFoldersOp',  parentId)
  const nodeList = await chrome.bookmarks.getChildren(parentId)

  const sortedNodeList = nodeList
    .filter(({ url }) => !url)
    .toSorted(({ title: a }, { title: b }) => a.localeCompare(b))

  let minMoveIndex = -1

  async function placeFolder({ node, index }) {
    let nodeActual = node

    if (0 <= minMoveIndex && minMoveIndex <= node.index) {
      ([nodeActual] = await chrome.bookmarks.get(node.id))
    }

    if (nodeActual.index != index) {
      await moveBookmark({ id: node.id, index })

      if (minMoveIndex == -1) {
        minMoveIndex = index
      }
    }
  }

  await sortedNodeList.reduce(
    (promiseChain, node, index) => promiseChain.then(
      () => placeFolder({ node, index })
    ),
    Promise.resolve(),
  );

  // console.log('Sorted',  sortedNodeList.map(({ title }) => title))
}

export async function sortFolders() {
  await sortChildren(BOOKMARKS_BAR_FOLDER_ID)
  await sortChildren(OTHER_BOOKMARKS_FOLDER_ID)
}
