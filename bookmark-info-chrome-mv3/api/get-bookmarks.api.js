import {
  memo,
} from '../data-structures/index.js'
import {
  isSupportedProtocol,
  makeLogFunction,
} from '../api-low/index.js'
import {
  SOURCE,
} from '../constant/index.js'
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
    path.push(folder.title);
    currentId = folder.parentId;
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
    const unknownFolderList = await chrome.bookmarks.get(unknownParentIdList)

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

async function getBookmarkInfo({ url, isShowTitle }) {
  logGB('getBookmarkInfo () 00', url)
  const bkmListForUrl = await chrome.bookmarks.search({ url });
  logGB('getBookmarkInfo () 11 search({ url })', bkmListForUrl.length, bkmListForUrl)
  const bookmarkList = bkmListForUrl.map((item) => ({ ...item, source: 'original url' }))

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
        folder: fullPathList.at(-1),
        path: fullPathList.slice(0, -1).concat('').join('/ '),
        parentId: bookmarkItem.parentId,
        source: bookmarkItem.source,
        ...(isShowTitle ? { title: bookmarkItem.title } : {})
      }
    });
}

export async function getBookmarkInfoUni({ url, useCache=false, isShowTitle }) {
  if (!url || !isSupportedProtocol(url)) {
    return;
  }

  let bookmarkList;
  let source;

  if (useCache) {
    bookmarkList = memo.cacheUrlToInfo.get(url);

    if (bookmarkList) {
      source = SOURCE.CACHE;
      logGB('getBookmarkInfoUni OPTIMIZATION: from cache bookmarkInfo')
    }
  }

  if (!bookmarkList) {
    bookmarkList = await getBookmarkInfo({ url, isShowTitle });
    source = SOURCE.ACTUAL;
    memo.cacheUrlToInfo.add(url, bookmarkList);
  }

  return {
    bookmarkList,
    source,
  };
}

export async function getPartialBookmarkList({ url, exactBkmIdList = [] }) {
  // 1 < pathname.length : it is not root path
  //    for https://www.youtube.com/watch?v=qqqqq other conditions than 1 < pathname.length
  // urlForSearch !== url : original url has search params, ending /, index[.xxxx]
  //  original url can be normalized yet, but I want get url with search params, ending /, index[.xxxx]

  const {
    isSearchAvailable,
    urlForSearch,
    isUrlMatchToPartialUrlSearch,
  } = await startPartialUrlSearch(url)
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
        folder: folder?.title,
        parentId: bookmarkItem.parentId,
        url: bookmarkItem.url,
      }
    });
}
