import {
  BOOKMARKS_BAR_FOLDER_ID,
  OTHER_BOOKMARKS_FOLDER_ID,
} from '../folder-api/index.js';
import {
  moveFolderIgnoreInController,
  removeFolder,
  updateFolder,
} from '../bookmark-controller-api/index.js';
import {
  traverseFolderRecursively,
} from './traverseFolder.js'

async function getMaxUsedSuffix() {
  async function getFolders() {
    const folderById = {};
    let nTotalBookmark = 0
    let nTotalFolder = 0

    function onFolder({ folder, bookmarkList }) {
      folderById[folder.id] = {
        id: folder.id,
        title: folder.title,
      }

      nTotalBookmark += bookmarkList.length
      nTotalFolder += 1
    }

    const [rootFolder] = await chrome.bookmarks.getTree();
    await traverseFolderRecursively({ folder: rootFolder, onFolder })

    return {
      folderById,
      nTotalBookmark,
      nTotalFolder,
    };
  }

  const { folderById } = await getFolders();

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

async function flatChildren({ parentId, freeSuffix }) {
  if (!parentId) {
    return []
  }

  const moveList = []
  const flatFolderNameSet = new Set()

  function onFolder({ folder, bookmarkList, level }) {
    const oData = {
      id: folder.id,
      bookmarkListLength: bookmarkList.length,
      level,
    }

    if (flatFolderNameSet.has(folder.title)) {
      oData.newTitle = `${folder.title} ${freeSuffix}`
      freeSuffix += 1

      flatFolderNameSet.add(oData.newTitle)
    } else {
      flatFolderNameSet.add(folder.title)
    }

    moveList.push(oData)
  }

  const [rootFolder] = await chrome.bookmarks.getSubTree(parentId)
  await traverseFolderRecursively({ folder: rootFolder, onFolder, startLevel: 0 })


  const sortedMoveList = moveList
    .sort((a,b) => -(a.level - b.level))

  await sortedMoveList.reduce(
    (promiseChain, { id, bookmarkListLength, level, newTitle }) => promiseChain.then(
      async () => {
        if (0 < bookmarkListLength) {
          if (1 < level) {
            await moveFolderIgnoreInController({ id, parentId })
          }
          if (newTitle && 0 < level) {
            await updateFolder({ id, title: newTitle })
          }
        } else {
          if (0 < level) {
            await removeFolder(id)
          }
        }
      }
    ),
    Promise.resolve(),
  );
}

export async function flatFolders() {
  const usedSuffix = await getMaxUsedSuffix()
  let freeSuffix = usedSuffix ? usedSuffix + 1 : 1;

  await flatChildren({ parentId: BOOKMARKS_BAR_FOLDER_ID, freeSuffix })
  await flatChildren({ parentId: OTHER_BOOKMARKS_FOLDER_ID, freeSuffix })
}
