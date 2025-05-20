import {
  moveFolderIgnoreInController,
} from '../bookmark-controller-api/index.js'

export async function sortFolders({ parentId, compare=(a,b)=> a.localeCompare(b) }) {
  if (!parentId) {
    return
  }

  // console.log('sortChildFoldersOp',  parentId)
  const nodeList = await chrome.bookmarks.getChildren(parentId)

  const sortedNodeList = nodeList
    .filter(({ url }) => !url)
    .toSorted(({ title: a }, { title: b }) => compare(a,b))

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
}
