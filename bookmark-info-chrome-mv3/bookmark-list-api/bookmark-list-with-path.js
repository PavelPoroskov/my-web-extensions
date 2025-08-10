import {
  memo,
} from '../api-mid/index.js'
import {
  getBookmarkNodeList,
} from './bookmark-list.js'

const getParentIdList = (bookmarkList = []) => {
  const parentIdList = bookmarkList
    .map(({ parentId }) => parentId)
    .filter(Boolean)

  return Array.from(new Set(parentIdList))
}

const getFullPath = (id, bkmFolderById) => {
  const path = [];

  let currentId = id;
  while (currentId) {
    const folder = bkmFolderById.get(currentId);

    if (folder) {
      path.push(folder.title);
    }

    currentId = folder?.parentId;
  }

  return path.filter(Boolean).toReversed()
}

async function getFolderInfoRecursively({ bookmarkList, folderByIdMap }) {
  // parentIdList.length <= bookmarkList.length
  // for root folders parentIdList=[]
  const parentIdList = getParentIdList(bookmarkList)

  if (parentIdList.length === 0) {
    return
  }

  const knownParentIdList = [];
  const unknownParentIdList = [];

  parentIdList.forEach((id) => {
    if (folderByIdMap.has(id)) {
      knownParentIdList.push(id)
    } else {
      unknownParentIdList.push(id)
    }
  })

  const knownFolderList = knownParentIdList.map((id) => folderByIdMap.get(id))

  const unknownFolderList = await getBookmarkNodeList(unknownParentIdList)

  unknownFolderList.forEach((folder) => {
    folderByIdMap.add(
      folder.id,
      {
        title: folder.title,
        parentId: folder.parentId,
      }
    )

    knownFolderList.push(folder)
  })

  await getFolderInfoRecursively({
    bookmarkList: knownFolderList,
    folderByIdMap,
  })
}

export async function addBookmarkPathInfo(bookmarkList) {

  await getFolderInfoRecursively({
    bookmarkList,
    folderByIdMap: memo.bkmFolderById,
  })

  const listWithPath = bookmarkList
    .map((bookmark) => {
      const fullPathList = getFullPath(bookmark.parentId, memo.bkmFolderById)

      return {
        ...bookmark,
        parentTitle: fullPathList.at(-1),
        path: fullPathList.slice(0, -1).concat('').join('/ '),
      }
    });

  return listWithPath
}
