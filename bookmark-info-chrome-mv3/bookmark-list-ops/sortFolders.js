import {
  OTHER_BOOKMARKS_FOLDER_ID,
  isDatedFolderTemplate,
} from '../folder-api/index.js';
import {
  moveFolderIgnoreInController,
} from '../bookmark-controller-api/index.js'

export async function sortFolders(parentId) {
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
      await moveFolderIgnoreInController({ id: node.id, index })

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

  if (parentId == OTHER_BOOKMARKS_FOLDER_ID) {
    const subfolderList = sortedNodeList
      .filter(({ title }) => isDatedFolderTemplate(title))

    await subfolderList.reduce(
      (promiseChain, node) => promiseChain.then(
        () => sortFolders(node.id)
      ),
      Promise.resolve(),
    );
  }

  // console.log('Sorted',  sortedNodeList.map(({ title }) => title))
}
