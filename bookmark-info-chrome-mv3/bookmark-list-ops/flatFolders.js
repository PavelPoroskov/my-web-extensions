import {
  getDatedRootFolderId,
  BOOKMARKS_BAR_FOLDER_ID,
  OTHER_BOOKMARKS_FOLDER_ID,
} from '../folder-api/index.js';
import {
  moveFolderIgnoreInController,
  removeFolderIgnoreInController,
  updateFolderIgnoreInController,
} from '../bookmark-controller-api/index.js';

async function getMaxUsedSuffix() {
  function getFoldersFromTree(tree) {
    const folderById = {};
    let nTotalBookmark = 0
    let nTotalFolder = 0

    function getFoldersFromNodeArray(nodeArray) {
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

async function flatChildren({ parentId, freeSuffix, datedRootId }) {
  const notFlatFolderList = []
  const flatFolderList = []

  const [otherBookmarks] = await chrome.bookmarks.getSubTree(parentId)

  for (const node of otherBookmarks.children) {
    if (!node.url) {
      if (node.id == datedRootId) {
        continue
      }

      const childrenFolderList = node.children.filter(({ url }) => !url)

      if (childrenFolderList.length > 0) {
        notFlatFolderList.push(node)
      } else {
        // flatFolderNameSet.add(node.title)
        flatFolderList.push(node)
      }
    }
  }

  const flatFolderNameSet = new Set()

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
  await updateTaskList.reduce(
    (promiseChain, { id, title }) => promiseChain.then(
      () => updateFolderIgnoreInController({ id, title })
    ),
    Promise.resolve(),
  );

  async function flatFolder(rootFolder) {
    async function traverseSubFolder(folderNode, folderLevel) {
      const folderList = folderNode.children
        .filter(({ url }) => !url)
      const bookmarkList = folderNode.children
        .filter(({ url }) => !!url)

      await folderList.reduce(
        (promiseChain, node) => promiseChain.then(
          () => traverseSubFolder(node, folderLevel + 1)
        ),
        Promise.resolve(),
      );

      if (bookmarkList.length > 0) {
        if (folderLevel > 0) {
          await moveFolderIgnoreInController({ id: folderNode.id, parentId })

          if (flatFolderNameSet.has(folderNode.title)) {
            const newTitle = `${folderNode.title} ${freeSuffix}`
            freeSuffix += 1

            await updateFolderIgnoreInController({
              id: folderNode.id,
              title: newTitle,
            })
            flatFolderNameSet.add(newTitle)
          } else {
            flatFolderNameSet.add(folderNode.title)
          }
        }
      } else {
        await removeFolderIgnoreInController(folderNode.id)
      }
    }

    await traverseSubFolder(rootFolder, 0)
  }

  // flat
  await notFlatFolderList.reduce(
    (promiseChain, node) => promiseChain.then(
      () => flatFolder(node)
    ),
    Promise.resolve(),
  );
}

export async function flatFolders() {
  const usedSuffix = await getMaxUsedSuffix()
  let freeSuffix = usedSuffix ? usedSuffix + 1 : 1;
  const datedRootFolderId = await getDatedRootFolderId()

  await flatChildren({ parentId: BOOKMARKS_BAR_FOLDER_ID, freeSuffix })
  await flatChildren({ parentId: OTHER_BOOKMARKS_FOLDER_ID, freeSuffix, datedRootId: datedRootFolderId })
}
