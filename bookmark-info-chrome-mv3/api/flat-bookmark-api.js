import { ExtraMap } from './module.js'
import {
  IS_BROWSER_FIREFOX,
} from '../constant/index.js';

let BOOKMARKS_BAR_ID = '1'
let OTHER_BOOKMARKS_ID = '2'

if (IS_BROWSER_FIREFOX) {
  BOOKMARKS_BAR_ID = 'toolbar_____'
  OTHER_BOOKMARKS_ID = 'unfiled_____'
}

const nestedRootTitle = 'yy-bookmark-info--nested'
const unclassifiedTitle = 'unclassified'

function getMaxUsedSuffix(folderById) {
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
          parentId: node.parentId,
          node,
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

async function flatFolders({ nestedRootId, unclassifiedId, freeSuffix }) {
  const bookmarksBarChildrenList = await chrome.bookmarks.getChildren(BOOKMARKS_BAR_ID)
  await Promise.all(
    bookmarksBarChildrenList
      .filter(({ url }) => !url)
      .map((node) => chrome.bookmarks.move(node.id, { parentId: OTHER_BOOKMARKS_ID }))
  ) 

  const notFlatFolderList = []
  const flatFolderList = []
  const rootBookmarkList = []

  const [otherBookmarks] = await chrome.bookmarks.getSubTree(OTHER_BOOKMARKS_ID)

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

      if (folderLevel > 0 && bookmarkList.length > 0) {
        await chrome.bookmarks.move(folderNode.id, { parentId: OTHER_BOOKMARKS_ID })

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

  const otherBookmarksChildrenList = await chrome.bookmarks.getChildren(OTHER_BOOKMARKS_ID)
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
        parentId: OTHER_BOOKMARKS_ID,
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
    [OTHER_BOOKMARKS_ID]: nestedRootId,
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

async function updateNestedFolders({ nestedRootId }) {
  const otherBookmarksChildrenList = await chrome.bookmarks.getChildren(OTHER_BOOKMARKS_ID)
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

  const sortedList = nodeList
    .filter(({ url }) => !url)
    .map(({ id, index, title }) => ({ id, actualIndex: index, title }))
    .toSorted(({ title: a }, { title: b }) => a.localeCompare(b))

  // for (let index = 0; index < sortedList.length; index += 1) {
  //   await chrome.bookmarks.move(sortedList[index].id, { index })
  // }

  const STATE = {
    SKIP_AFTER_START: 'SKIP_AFTER_START',
    AFTER_MOVE: 'AFTER_MOVE',
    SKIP_AFTER_MOVE: 'SKIP_AFTER_MOVE'
  }

  let mMove = 0
  let state = STATE.SKIP_AFTER_START
  let index = 0
  let actualContinueIndex
  while (index < sortedList.length) {
    switch (state) {
      case STATE.SKIP_AFTER_START: {
        if (sortedList[index].actualIndex !== index) {
          await chrome.bookmarks.move(sortedList[index].id, { index })
          state = STATE.AFTER_MOVE
          mMove += 1
        }
        break
      }
      case STATE.AFTER_MOVE: {
        const node = await chrome.bookmarks.get(sortedList[index].id)

        if (node.index === index) {
          state = STATE.SKIP_AFTER_MOVE
          actualContinueIndex = sortedList[index].actualIndex
        } else {
          await chrome.bookmarks.move(sortedList[index].id, { index })
          state = STATE.AFTER_MOVE
          mMove += 1
        }
        break
      }
      case STATE.SKIP_AFTER_MOVE: {
        if (sortedList[index].actualIndex === actualContinueIndex - 1) {
          state = STATE.SKIP_AFTER_MOVE
          actualContinueIndex = sortedList[index].actualIndex
        } else {
          await chrome.bookmarks.move(sortedList[index].id, { index })
          state = STATE.AFTER_MOVE
          mMove += 1
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

export async function flatBookmarks() {
  //1) get information: 
  //  folder has subfolders
  //  level
  // get last used suffix

  //2) move bookmarks to flat folders
  // from most deep

  //3) sort

  const bookmarkTree = await chrome.bookmarks.getTree();
  const {
    folderById,
    // nTotalBookmark,
    // nTotalFolder,
  } = getFoldersFromTree(bookmarkTree);
  // console.log('nTotalFolder ', nTotalFolder)
  // console.log('nTotalBookmark ', nTotalBookmark)

  const usedSuffix = getMaxUsedSuffix(folderById)
  let freeSuffix = usedSuffix ? usedSuffix + 1 : 1;


  let nestedRootId
  const findItem = Object.values(folderById).find(({ title }) => title === nestedRootTitle)

  if (findItem) {
    nestedRootId = findItem.id
  } else {
    const createdItem = await chrome.bookmarks.create({
      parentId: OTHER_BOOKMARKS_ID,
      title: nestedRootTitle
    })
    nestedRootId = createdItem.id
  }

  let unclassifiedId
  const findItem2 = Object.values(folderById).find(({ title }) => title === unclassifiedTitle)

  if (findItem2) {
    unclassifiedId = findItem2.id
  } else {
    const createdItem2 = await chrome.bookmarks.create({
      parentId: OTHER_BOOKMARKS_ID,
      title: unclassifiedTitle
    })
    unclassifiedId = createdItem2.id
  }

  const { toCopyFolderById } = await flatFolders({ nestedRootId, unclassifiedId, freeSuffix })
  await moveLinksFromNestedRoot({ nestedRootId, unclassifiedId })
  await createNestedFolders({ toCopyFolderById, nestedRootId })

  // TODO ?delete empty folders

  // TODO ?delete from "Other bookmarks/yy-bookmark-info--nested" folders that was deleted from first level folders
  //await updateNestedFolders({ nestedRootId })

  await sortChildren({ id: OTHER_BOOKMARKS_ID })
  await sortChildren({ id: nestedRootId, recursively: true })
}