import { ExtraMap } from './module.js'

const bookmarksBarId = '1'
const otherBookmarksId = '2'
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


async function sortChildren({ id, recursively = false }) {
  const nodeList = await chrome.bookmarks.getChildren(id)

  const sortedList = nodeList
    .filter(({ url }) => !url)
    .map(({ id, index, title }) => ({ id, index, title }))
    .toSorted(({ title: a }, { title: b }) => a.localeCompare(b))

  await Promise.all(
    sortedList.map(
      ({ id }, index) => chrome.bookmarks.move(id, { index })
    )
  )

  if (recursively) {
    await Promise.all(
      sortedList.map(
        ({ id }) => sortChildren({ id })
      )
    )
  }
}

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

export async function flatBookmarks() {
  // get last used suffix
  

  //1) get information: 
  //  folder has subfolders
  //  level

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
      parentId: otherBookmarksId,
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
      parentId: otherBookmarksId,
      title: unclassifiedTitle
    })
    unclassifiedId = createdItem2.id
  }

  await Promise.all(
    folderById[bookmarksBarId].node.children
      .filter(({ url }) => !url)
      .map((node) => chrome.bookmarks.move(node.id, { parentId: otherBookmarksId }))
  ) 

  const toFlatFolderList = []
  const rootBookmarkList = []
  const flatFolderNameSet = new Set()
  const [otherBookmarks] = await chrome.bookmarks.getSubTree(otherBookmarksId)

  for (const node of otherBookmarks.children) {
    if (!node.url) {
      const childrenFolderList = node.children.filter(({ url }) => !url)

      if (node.id !== nestedRootId) {
        if (childrenFolderList.length > 0) {
          toFlatFolderList.push(node)
        } else {
          flatFolderNameSet.add(node.title)
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
      
      await Promise.all(folderList.map(
        (node) => traverseSubFolder(node, folderLevel + 1)
      ))

      if (folderLevel > 0) {
        // TODO if name is in use
        await chrome.bookmarks.move(folderNode.id, { parentId: otherBookmarksId })

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
  await Promise.all(toFlatFolderList.map(
    (node) => flatFolder(node)
  )) 

  // create nested
  // group by level
  const folderByLevelMap = new ExtraMap()
  Object.values(toCopyFolderById).forEach((item) => {
    folderByLevelMap.concat(item.folderLevel, item)
  })

  const sortedLevelList = Array.from(folderByLevelMap.keys())
    .toSorted((a,b) => a - b)

  const oldToNewIdMap = {
    [otherBookmarksId]: nestedRootId,
  }
  const childrenMap = {}

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
  async function createNestedFolders() {
    const level = sortedLevelList.shift()

    if (level !== undefined) {
      const list = folderByLevelMap.get(level)
      await Promise.all(list.map(findOrCreateFolder))

      await createNestedFolders()
    }
  }

  await createNestedFolders()

  await sortChildren({ id: otherBookmarksId })
  await sortChildren({ id: nestedRootId, recursively: true })
}