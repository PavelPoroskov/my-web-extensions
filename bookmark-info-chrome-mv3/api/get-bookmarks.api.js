import {
  memo,
} from '../api-mid/index.js'
import {
  getBookmarkListDirty,
  makeLogFunction,
} from '../api-low/index.js'
import {
  startPartialUrlSearch,
} from '../url-api/index.js'

const logGB = makeLogFunction({ module: 'get-bookmarks.api.js' })

const getParentIdList = (bookmarkList = []) => {
  const parentIdList = bookmarkList
    .map((bookmarkItem) => bookmarkItem.parentId)
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

async function addBookmarkParentInfo({ bookmarkList, folderByIdMap, isFullPath = true }) {
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

  if (unknownParentIdList.length > 0) {
    const unknownFolderList = await getBookmarkListDirty(unknownParentIdList)

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
  }

  if (isFullPath) {
    return await addBookmarkParentInfo({
      bookmarkList: knownFolderList,
      folderByIdMap,
      isFullPath,
    })
  }
}

export async function getBookmarkList({ url, isShowTitle, isShowUrl }) {
  logGB('getBookmarkInfo () 00', url)
  const bookmarkList = await chrome.bookmarks.search({ url });
  logGB('getBookmarkInfo () 11 search({ url })', bookmarkList.length, bookmarkList)

  await addBookmarkParentInfo({
    bookmarkList,
    folderByIdMap: memo.bkmFolderById,
    isFullPath: true,
  })

  logGB('getBookmarkInfo () 99 bookmarkList', bookmarkList.length, bookmarkList)
  return bookmarkList
    .map((bookmarkItem) => {
      const fullPathList = getFullPath(bookmarkItem.parentId, memo.bkmFolderById)

      return {
        id: bookmarkItem.id,
        ...(isShowUrl ? { url: bookmarkItem.url } : {}),
        ...(isShowTitle ? { title: bookmarkItem.title } : {}),
        parentId: bookmarkItem.parentId,
        parentTitle: fullPathList.at(-1),
        path: fullPathList.slice(0, -1).concat('').join('/ '),
      }
    });
}

export async function getPartialBookmarkList({ url, exactBkmIdList = [], pathnamePattern }) {
  // 1 < pathname.length : it is not root path
  //    for https://www.youtube.com/watch?v=qqqqq other conditions than 1 < pathname.length
  // urlForSearch !== url : original url has search params, ending /, index[.xxxx]
  //  original url can be normalized yet, but I want get url with search params, ending /, index[.xxxx]

  const {
    isSearchAvailable,
    urlForSearch,
    isUrlMatchToPartialUrlSearch,
  } = await startPartialUrlSearch({ url, pathnamePattern })
  logGB('getPartialBookmarkList () 22 startPartialUrlSearch', { isSearchAvailable, urlForSearch })

  if (!isSearchAvailable) {
    return []
  }

  const bkmListForSubstring = await chrome.bookmarks.search(urlForSearch);
  logGB('getPartialBookmarkList () 33 search(normalizedUrl)', bkmListForSubstring.length, bkmListForSubstring)

  const yetSet = new Set(exactBkmIdList)
  const partialBookmarkList = []
  bkmListForSubstring.forEach((bkm) => {
    if (bkm.url && isUrlMatchToPartialUrlSearch(bkm.url) && !yetSet.has(bkm.id)) {
      partialBookmarkList.push(bkm)
    }
  })

  await addBookmarkParentInfo({
    bookmarkList: partialBookmarkList,
    folderByIdMap: memo.bkmFolderById,
    isFullPath: false,
  })

  return partialBookmarkList
    .map((bookmarkItem) => {
      const folder = memo.bkmFolderById.get(bookmarkItem.parentId);

      return {
        id: bookmarkItem.id,
        url: bookmarkItem.url,
        parentId: bookmarkItem.parentId,
        parentTitle: folder?.title,
      }
    });
}
