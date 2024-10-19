import {
  removeDoubleBookmarks,
} from './removeDoubleBookmarks.api.js';
import {
  BOOKMARKS_BAR_FOLDER_ID,
  getOrCreateNestedRootFolderId,
  getOrCreateUnclassifiedFolderId,
  isDescriptiveFolderTitle,
  OTHER_BOOKMARKS_FOLDER_ID,
} from './special-folder.api.js';
import {
  ExtraMap,
  tagList,
} from './structure/index.js';

async function getMaxUsedSuffix() {
  function getFoldersFromTree(tree) {
    const folderById = {};
    let nTotalBookmark = 0
    let nTotalFolder = 0
  
    function getFoldersFromNodeArray (nodeArray) {
      let nBookmark = 0
      let nFolder = 0
  
      nodeArray.forEach((node) => {
        if (node.url) {
          nBookmark += 1
        } else {
          nFolder += 1
  
          folderById[node.id] = {
            id: node.id,
            title: node.title,
          }
  
          getFoldersFromNodeArray(node.children)
        }
      });
  
      nTotalBookmark += nBookmark
      nTotalFolder += nFolder
    }
  
    getFoldersFromNodeArray(tree);
  
    return {
      folderById,
      nTotalBookmark,
      nTotalFolder,
    };
  }

  const bookmarkTree = await chrome.bookmarks.getTree();
  const { folderById } = getFoldersFromTree(bookmarkTree);

  let maxUsedSuffix
  const allowedFirstChar = '123456789'
  const allowedSecondChar = '0123456789'

  Object.values(folderById).forEach(({ title }) => {
    const wordList = title.trimEnd().split(' ')
    const lastWord = wordList.at(-1)
    const firstWord = wordList.at(-2)

    if (firstWord) {
      const firstChar = lastWord[0]
      const secondCharList = Array.from(lastWord.slice(1))
  
      const isNumber = allowedFirstChar.includes(firstChar) && secondCharList.every((secondChar) => allowedSecondChar.includes(secondChar))

      if (isNumber) {
        maxUsedSuffix = Math.max(maxUsedSuffix || 0, +lastWord)
      }
    }
  })

  return maxUsedSuffix
}
function isStartWithTODO(str) {
  return !!str && str.slice(0, 4).toLowerCase() === 'todo'
}

async function flatBarFolder({ isMoveTodoToBarFolder }) {
  const childrenList = await chrome.bookmarks.getChildren(BOOKMARKS_BAR_FOLDER_ID)
  const folderList = childrenList
    .filter(({ url }) => !url)

  let moveList = []

  if (isMoveTodoToBarFolder) {
    const notMoveList = []
    folderList.forEach((node) => {
      if (isStartWithTODO(node.title)) {
        notMoveList.push(node)
      } else {
        moveList.push(node)
      }
    })

    const childrenListList = await Promise.all(
      notMoveList.map(
        (node) => chrome.bookmarks.getChildren(node.id)
      )
    )
    const subFolderList = childrenListList.flat().filter(({ url }) => !url)
    subFolderList.forEach((node) => {
      moveList.push(node)
    })
  } else {
    moveList = folderList
  }

  await Promise.all(
    moveList.map(
      (node) => chrome.bookmarks.move(node.id, { parentId: OTHER_BOOKMARKS_FOLDER_ID })
    )
  ) 
}

async function flatOtherFolder({ nestedRootId, unclassifiedId, freeSuffix }) {
  const notFlatFolderList = []
  const flatFolderList = []
  const rootBookmarkList = []

  const [otherBookmarks] = await chrome.bookmarks.getSubTree(OTHER_BOOKMARKS_FOLDER_ID)

  for (const node of otherBookmarks.children) {
    if (!node.url) {
      const childrenFolderList = node.children.filter(({ url }) => !url)

      if (node.id !== nestedRootId) {
        if (childrenFolderList.length > 0) {
          notFlatFolderList.push(node)
        } else {
          // flatFolderNameSet.add(node.title)
          flatFolderList.push(node)
        }
      }
    } else {
      rootBookmarkList.push(node.id)
    }
  }

  if (rootBookmarkList.length > 0) {
    await Promise.all(rootBookmarkList.map(
      (id) => chrome.bookmarks.move(id, { parentId: unclassifiedId })
    ))    
  }

  // let order = 0
  const toCopyFolderById = {}
  const flatFolderNameSet = new Set()

  async function flatFolder(rootFolder) {
    async function traverseSubFolder(folderNode, folderLevel) {
      // order += 1
      toCopyFolderById[folderNode.id] = {
        id: folderNode.id,
        parentId: folderNode.parentId,
        title: folderNode.title,
        folderLevel,
        // order,
      }
      const folderList = folderNode.children
        .filter(({ url }) => !url)
      const bookmarkList = folderNode.children
        .filter(({ url }) => !!url)

      await Promise.all(folderList.map(
        (node) => traverseSubFolder(node, folderLevel + 1)
      ))

      if (bookmarkList.length > 0) {
        if (folderLevel > 0) {
          await chrome.bookmarks.move(folderNode.id, { parentId: OTHER_BOOKMARKS_FOLDER_ID })

          if (flatFolderNameSet.has(folderNode.title)) {
            const newTitle = `${folderNode.title} ${freeSuffix}`
            freeSuffix += 1

            await chrome.bookmarks.update(folderNode.id, {
              title: newTitle,
            })
            toCopyFolderById[folderNode.id].newTitle = newTitle
            flatFolderNameSet.add(newTitle)
          } else {
            flatFolderNameSet.add(folderNode.title)
          }
        }
      } else {
        await chrome.bookmarks.remove(folderNode.id)
      }

    }

    await traverseSubFolder(rootFolder, 0)
  }

  // flat
  await Promise.all(notFlatFolderList.map(
    (node) => flatFolder(node)
  )) 

  // prefer change name for flat folder than for nested folder
  const updateTaskList = []
  flatFolderList.forEach((folderNode) => {
    if (flatFolderNameSet.has(folderNode.title)) {
      const newTitle = `${folderNode.title} ${freeSuffix}`
      freeSuffix += 1

      updateTaskList.push({
        id: folderNode.id, 
        title: newTitle,
      })
    }
  })
  await Promise.all(updateTaskList.map(
    ({ id, title }) => chrome.bookmarks.update(id, { title })
  )) 

  return { toCopyFolderById }
}

async function moveLinksFromNestedRoot({ nestedRootId, unclassifiedId }) {
  const [nestedRoot] = await chrome.bookmarks.getSubTree(nestedRootId)
  const rootBookmarkList = []
  const folderList = []

  for (const node of nestedRoot.children) {
    if (!node.url) {
      folderList.push(node)
    } else {
      rootBookmarkList.push(node.id)
    }
  }

  if (rootBookmarkList.length > 0) {
    await Promise.all(rootBookmarkList.map(
      (id) => chrome.bookmarks.move(id, { parentId: unclassifiedId })
    ))    
  }

  const toMoveFolder = []

  async function traverseFolder(folderNode) {
    // order += 1

    const folderList = folderNode.children
      .filter(({ url }) => !url)
    const bookmarkList = folderNode.children
      .filter(({ url }) => !!url)
      .map(({ id }) => id)

    if (bookmarkList.length > 0) {
      toMoveFolder.push({
        id: folderNode.id,
        title: folderNode.title,
        bookmarkList
      })
    }
    
    await Promise.all(folderList.map(
      (node) => traverseFolder(node)
    ))
  }

  await Promise.all(folderList.map(
    (node) => traverseFolder(node)
  )) 

  const otherBookmarksChildrenList = await chrome.bookmarks.getChildren(OTHER_BOOKMARKS_FOLDER_ID)
  const flatFolderNameToIdMap = Object.fromEntries(
    otherBookmarksChildrenList
      .filter((node) => !node.url)
      .filter((node) => node.id !== nestedRootId)
      .map(({ id, title }) => [title, id])
  )

  async function moveBookmarks({ title, bookmarkList }) {
    let parentId = flatFolderNameToIdMap[title]

    if (!parentId) {
      const createdItem = await chrome.bookmarks.create({
        parentId: OTHER_BOOKMARKS_FOLDER_ID,
        title
      })
      parentId = createdItem.id
    }

    await Promise.all(
      bookmarkList.map((id) => chrome.bookmarks.move(id, { parentId }))
    )
  }

  await Promise.all(
    toMoveFolder.map(moveBookmarks)
  )
} 

async function createNestedFolders({ toCopyFolderById, nestedRootId }) {
  const oldToNewIdMap = {
    [OTHER_BOOKMARKS_FOLDER_ID]: nestedRootId,
  }
  const childrenMap = {}

  async function getAllChildrenByTitle(id) {
    const folderList = []
  
    function getFoldersFromNodeArray (nodeArray) {
      nodeArray.forEach((node) => {
        if (!node.url) {
          folderList.push({
            id: node.id,
            title: node.title,
          })
  
          getFoldersFromNodeArray(node.children)
        }
      });
    }
  
    const [rootNode] = await chrome.bookmarks.getSubTree(id)
    getFoldersFromNodeArray(rootNode.children);
  
    return Object.fromEntries(
      folderList
        .map(({ title, id }) => [title, id])
    )
  }
  async function findOrCreateFolder({ id, title, newTitle, parentId }) {
    const newParentId = oldToNewIdMap[parentId]

    if (!childrenMap[newParentId]) {
      // childrenMap[newParentId] = chrome.bookmarks.getChildren(newParentId)
      //   .then((nodes) => Object.fromEntries(
      //     nodes
      //       .filter(({ url }) => !url)
      //       .map(({ title, id }) => [title, id])
      //   ))
      childrenMap[newParentId] = getAllChildrenByTitle(newParentId)
    }
    const children = await childrenMap[newParentId]
    let newId = children[title]

    if (!newId) {
      const newNode = await chrome.bookmarks.create({
        parentId: newParentId,
        title: newTitle || title
      })
      newId = newNode.id
    }

    oldToNewIdMap[id] = newId
  }

  // group by level
  const folderByLevelMap = new ExtraMap()
  Object.values(toCopyFolderById).forEach((item) => {
    folderByLevelMap.concat(item.folderLevel, item)
  })

  const sortedLevelList = Array.from(folderByLevelMap.keys())
    .toSorted((a,b) => a - b)

  for (const level of sortedLevelList) {
    const list = folderByLevelMap.get(level)
    await Promise.all(list.map(findOrCreateFolder))
  }
}

// delete from "Other bookmarks/yy-bookmark-info--nested" folders that was deleted from first level folders
//
// eslint-disable-next-line no-unused-vars
async function updateNestedFolders({ nestedRootId }) {
  const otherBookmarksChildrenList = await chrome.bookmarks.getChildren(OTHER_BOOKMARKS_FOLDER_ID)
  const flatFolderNameSet = new Set(
    otherBookmarksChildrenList
      .filter((node) => !node.url)
      .filter((node) => node.id !== nestedRootId)
      .map(({ title }) => title)
  )

  const nestedFolderList = []
  
  function getFoldersFromNodeArray (nodeArray, level) {
    nodeArray.forEach((node) => {
      if (!node.url) {
        nestedFolderList.push({
          id: node.id,
          title: node.title,
          level,
        })

        getFoldersFromNodeArray(node.children, level + 1)
      }
    });
  }

  const [rootNode] = await chrome.bookmarks.getSubTree(nestedRootId)
  getFoldersFromNodeArray(rootNode.children, 0);

  // nestedFolderList.sort(({ level: a}, { level: b }) => -(a - b))

  const taskList = nestedFolderList
    .filter(({ title }) => !flatFolderNameSet.has(title))

  // group by level
  const folderByLevelMap = new ExtraMap()
  Object.values(taskList).forEach((item) => {
    folderByLevelMap.concat(item.level, item)
  })

  const sortedLevelList = Array.from(folderByLevelMap.keys())
    .toSorted((a,b) => -(a - b))

  async function removeFolder(id) {
    const children = chrome.bookmarks.getChildren(id)

    if (children.length === 0) {
      await chrome.bookmarks.remove(id)
    }
  }

  for (const level of sortedLevelList) {
    const list = folderByLevelMap.get(level)
    await Promise.all(list.map(
      ({ id }) => removeFolder(id))
    )
  }
}

async function sortChildren({ id, recursively = false }) {
  const nodeList = await chrome.bookmarks.getChildren(id)
  // console.log('nodeList', nodeList);

  const sortedList = nodeList
    .filter(({ url }) => !url)
    .map(({ id, index, title }) => ({ id, actualIndex: index, title }))
    .toSorted(({ title: a }, { title: b }) => a.localeCompare(b))

  // console.log('sortedList', sortedList);

  // for (let index = 0; index < sortedList.length; index += 1) {
  //   await chrome.bookmarks.move(sortedList[index].id, { index })
  // }

  const STATE = {
    SKIP_AFTER_START: 'SKIP_AFTER_START',
    AFTER_MOVE: 'AFTER_MOVE',
    SKIP_AFTER_MOVE: 'SKIP_AFTER_MOVE'
  }

  let nMove = 0
  let state = STATE.SKIP_AFTER_START
  let index = 0
  let actualContinueIndex
  while (index < sortedList.length) {
    // console.log('state in', state, index, sortedList[index].actualIndex, mMove, sortedList[index].title);

    switch (state) {
      case STATE.SKIP_AFTER_START: {

        if (sortedList[index].actualIndex !== index) {
          await chrome.bookmarks.move(sortedList[index].id, { index })
          state = STATE.AFTER_MOVE
          nMove += 1
          // console.log('MOVE 1', sortedList[index].actualIndex, index, sortedList[index].title);
        }
        break
      }
      case STATE.AFTER_MOVE: {
        const [node] = await chrome.bookmarks.get(sortedList[index].id)

        if (node.index === index) {
          state = STATE.SKIP_AFTER_MOVE
          actualContinueIndex = sortedList[index].actualIndex
          // actualContinueIndex = node.index

          // state = STATE.SKIP_AFTER_START
        } else {
          await chrome.bookmarks.move(sortedList[index].id, { index })
          state = STATE.AFTER_MOVE
          nMove += 1
          // console.log('MOVE 2', sortedList[index].actualIndex, index, sortedList[index].title);
        }

        break
      }
      case STATE.SKIP_AFTER_MOVE: {

        // if (sortedList[index].actualIndex === actualContinueIndex + 1) {
        if (sortedList[index].actualIndex > actualContinueIndex) {
          state = STATE.SKIP_AFTER_MOVE
          actualContinueIndex = sortedList[index].actualIndex
        } else {
          await chrome.bookmarks.move(sortedList[index].id, { index })
          state = STATE.AFTER_MOVE
          nMove += 1
          // console.log('MOVE 3', sortedList[index].actualIndex, index, sortedList[index].title);
        }

        break
      }
    }

    index += 1
  }

  // console.log('Sorting mMove1 ', mMove);

  if (recursively) {
    await Promise.all(
      sortedList.map(
        ({ id }) => sortChildren({ id })
      )
    )
  }

  return {
    nMove
  }
}

// async function sortChildren2({ id, recursively = false }) {
//   const nodeList = await chrome.bookmarks.getChildren(id)

//   const filteredList = nodeList
//     .filter(({ url }) => !url)
//     .map(({ id, title }) => ({ id, title }))

//   const sortIndex = Object.fromEntries(
//     filteredList
//       .toSorted(({ title: a }, { title: b }) => a.localeCompare(b))
//       .map(({ id }, index) => [id, index])
//   )
//   const actualList = filteredList.map(({ id }) => ({ id, order: sortIndex[id] }))

//   let mMove = 0
//   let index = 0
//   while (index < actualList.length) {
//     const { id, order } = actualList[index]

//     if (order < index) {
//       await chrome.bookmarks.move(id, { index: order })
//       actualList.splice(index, 1);
//       actualList.splice(order, 0, { id, order });
//       mMove += 1

//       index = order + 1
//     } else if (index < order) {
//       await chrome.bookmarks.move(id, { index: order })
//       actualList.splice(index, 1);
//       actualList.splice(order, 0, { id, order });
//       mMove += 1

//       // index += 1
//     } else {
//       index += 1
//     }
//   }

//   console.log('Sorting mMove2 ', mMove);
//   // folders 15, nMove2 132, error (one folder is not in order)

//   if (recursively) {
//     await Promise.all(
//       actualList.map(
//         ({ id }) => sortChildren({ id })
//       )
//     )
//   }
// }

async function moveContent(fromFolderId, toFolderId) {
  const nodeList = await chrome.bookmarks.getChildren(fromFolderId)
  const reversedNodeList = nodeList.toReversed()
  
  await Promise.all(reversedNodeList.map(
    ({ id }) => chrome.bookmarks.move(id, { parentId: toFolderId, index: 0 }))
  )
}

async function moveNotDescriptiveFolderToUnclassified({ unclassifiedId }) {
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

export async function flatBookmarks() {
  tagList.blockTagList(true)

  try {
    const usedSuffix = await getMaxUsedSuffix()
    let freeSuffix = usedSuffix ? usedSuffix + 1 : 1;
  
    const nestedRootId = await getOrCreateNestedRootFolderId()
    const unclassifiedId = await getOrCreateUnclassifiedFolderId()
  
    const isMoveTodoToBarFolder = true
    await flatBarFolder({ isMoveTodoToBarFolder })
    const { toCopyFolderById } = await flatOtherFolder({ nestedRootId, unclassifiedId, freeSuffix })
    await moveLinksFromNestedRoot({ nestedRootId, unclassifiedId })

    await createNestedFolders({ toCopyFolderById, nestedRootId })
    await moveNotDescriptiveFolderToUnclassified({ unclassifiedId })
    await removeDoubleBookmarks()

    // MAYBE? delete empty folders
    if (isMoveTodoToBarFolder) {
      const childrenList = await chrome.bookmarks.getChildren(OTHER_BOOKMARKS_FOLDER_ID)
      const moveList = childrenList
        .filter(({ url }) => !url)
        .filter(({ title }) => isStartWithTODO(title))

      await Promise.all(
        moveList.map(
          (node) => chrome.bookmarks.move(node.id, { parentId: BOOKMARKS_BAR_FOLDER_ID })
        )
      ) 
      await sortChildren({ id: BOOKMARKS_BAR_FOLDER_ID })
      // TODO merge folders with the same name: case insensitive, in barfolder
    }

    await sortChildren({ id: OTHER_BOOKMARKS_FOLDER_ID })
    // sort second time. my sorting algorithm has issue Not all item sorted for first pass
    await sortChildren({ id: OTHER_BOOKMARKS_FOLDER_ID })
    // TODO merge folders with the same name: case insensitive, in otherfolder

    // MAYBE? delete from "Other bookmarks/yy-bookmark-info--nested" folders that was deleted from first level folders
    //await updateNestedFolders({ nestedRootId })
    await sortChildren({ id: nestedRootId, recursively: true })
  } finally {
    tagList.blockTagList(false)
  }
}
