import {
    BOOKMARKS_BAR_FOLDER_ID,
    OTHER_BOOKMARKS_FOLDER_ID,
    // getNestedRootFolderId,
  } from '../api/special-folder.api.js';

// eslint-disable-next-line no-unused-vars
async function sortChildFolders(parentId) {
    const nodeList = await chrome.bookmarks.getChildren(parentId)
  
    const sortedNodeList = nodeList
      .filter(({ url }) => !url)
      .toSorted(({ title: a }, { title: b }) => a.toLowerCase().localeCompare(b.toLowerCase()))

    async function placeFolder({ id, index }) {
        const [node] = await chrome.bookmarks.get(id)

        if (node.index != index) {
            await chrome.bookmarks.move(id, { index })
        }
    }

    await sortedNodeList.reduce(
        (promiseChain, node, index) => promiseChain.then(() => placeFolder({ id: node.id, index })),
        Promise.resolve(),
    );
}

async function sortChildFoldersOp(parentId) {
    // console.log('sortChildFoldersOp',  parentId)
    const nodeList = await chrome.bookmarks.getChildren(parentId)
  
    const sortedNodeList = nodeList
      .filter(({ url }) => !url)
      .toSorted(({ title: a }, { title: b }) => a.toLowerCase().localeCompare(b.toLowerCase()))

    let minMoveIndex = -1

    async function placeFolder({ node, index }) {
        let nodeActual = node

        if (0 <= minMoveIndex && minMoveIndex <= node.index) {
            ([nodeActual] = await chrome.bookmarks.get(node.id))
        }

        if (nodeActual.index != index) {
            await chrome.bookmarks.move(node.id, { index })
            
            if (minMoveIndex == -1) {
                minMoveIndex = index
            }
        }
    }

    await sortedNodeList.reduce(
        (promiseChain, node, index) => promiseChain.then(() => placeFolder({ node, index })),
        Promise.resolve(),
    );

    // console.log('Sorted',  sortedNodeList.map(({ title }) => title))
}

async function sortSubtree({ id, recursively = false }) {
    await sortChildFoldersOp(id)
  
    // if (!recursively) {
    //     const nodeList2 = await chrome.bookmarks.getChildren(id)
    //     const filteredNodeList2 = nodeList2
    //         .filter(({ url }) => !url)
    //     const sortedNodeList2 = filteredNodeList2
    //         .toSorted(({ title: a }, { title: b }) => a.toLowerCase().localeCompare(b.toLowerCase()))

    //     const notSortedList = sortedNodeList2.filter((node, index) => node.id != filteredNodeList2[index].id)

    //     if (notSortedList.length > 0) {
    //         console.log('### sortFolders', id)
    //         console.log('### notSortedList', notSortedList.length)
    //         console.log(notSortedList)
    //     }
    // }

    if (recursively) {
        const nodeList = await chrome.bookmarks.getChildren(id)
        const folderList = nodeList.filter(({ url }) => !url)

        await Promise.all(
            folderList.map(
                ({ id }) => sortFolders({ id, recursively })
            )
        )
    }
}
  
export async function sortFolders() {
    await sortSubtree({ id: BOOKMARKS_BAR_FOLDER_ID })
    await sortSubtree({ id: OTHER_BOOKMARKS_FOLDER_ID })

    // const nestedRootId = await getNestedRootFolderId()
    // await sortSubtree({ id: nestedRootId, recursively: true })
}