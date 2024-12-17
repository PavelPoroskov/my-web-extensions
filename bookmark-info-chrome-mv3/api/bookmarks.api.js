import {
  memo,
} from './structure/index.js'
import {
  isSupportedProtocol,
} from './common.api.js'
import {
  SOURCE,
} from '../constant/index.js'
import {
  makeLogFunction,
} from './log.api.js'
import { 
  getRequiredSearchParamsForSearch,
  getUrlForSearchWithPathname, 
  isPathnameMatchForSearch,
  isSearchParamsMatchForSearch,
} from './url.api.js'

const logBA = makeLogFunction({ module: 'bookmarks.api' })

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

async function addBookmarkParentInfo(bookmarkList, bookmarkByIdMap) {
  // parentIdList.length <= bookmarkList.length
  // for root folders parentIdList=[]
  const parentIdList = getParentIdList(bookmarkList)

  if (parentIdList.length === 0) {
    return
  } 

  const knownParentIdList = [];
  const unknownParentIdList = [];

  parentIdList.forEach((id) => {
    if (bookmarkByIdMap.has(id)) {
      knownParentIdList.push(id)
    } else {
      unknownParentIdList.push(id)
    }
  })

  const knownFolderList = knownParentIdList.map((id) => bookmarkByIdMap.get(id))

  if (unknownParentIdList.length > 0) {
    const unknownFolderList = await chrome.bookmarks.get(unknownParentIdList)

    unknownFolderList.forEach((folder) => {
      bookmarkByIdMap.add(
        folder.id,
        {
          title: folder.title,
          parentId: folder.parentId,
        }
      )
      knownFolderList.push(folder)
    })
  }

  return await addBookmarkParentInfo(knownFolderList, bookmarkByIdMap)
}

async function getBookmarkInfo(url) {
  const bkmListForUrl = await chrome.bookmarks.search({ url });
  logBA('getBookmarkInfo () 11 search({ url })', bkmListForUrl.length, bkmListForUrl)
  const bookmarkList = bkmListForUrl.map((item) => ({ ...item, source: 'original url' }))

  // 1 < pathname.length : it is not root path
  //    for https://www.youtube.com/watch?v=qqqqq other conditions than 1 < pathname.length
  // urlForSearch !== url : original url has search params, ending /, index[.xxxx]
  //  original url can be normalized yet, but I want get url with search params, ending /, index[.xxxx]

  const urlForSearch = getUrlForSearchWithPathname(url);
  const requiredSearchParams = getRequiredSearchParamsForSearch(url)
  const { pathname: pathnameForSearch } = new URL(urlForSearch);

  const bkmListForSubstring = await chrome.bookmarks.search(urlForSearch);
  logBA('getBookmarkInfo () 22 search(normalizedUrl)', bkmListForSubstring.length, bkmListForSubstring)  
  const yetSet = new Set(bkmListForUrl.map(({ id }) => id))

  bkmListForSubstring.forEach((bkm) => {
    if (!yetSet.has(bkm.id) && bkm.url && isPathnameMatchForSearch({ url: bkm.url, pathnameForSearch })
      && isSearchParamsMatchForSearch({ url: bkm.url, requiredSearchParams })) {
      bookmarkList.push({
        ...bkm,
        source: 'substring',
      })
    }
  })  

  await addBookmarkParentInfo(bookmarkList, memo.bkmFolderById)

  logBA('getBookmarkInfo () 33 bookmarkList', bookmarkList.length, bookmarkList)
  return bookmarkList
    .map((bookmarkItem) => {
      const fullPathList = getFullPath(bookmarkItem.parentId, memo.bkmFolderById)
      
      return {
        id: bookmarkItem.id,
        fullPathList,
        title: bookmarkItem.title,
        parentId: bookmarkItem.parentId,
        source: bookmarkItem.source,
        url: bookmarkItem.url,
      }
    });
}

export async function getBookmarkInfoUni({ url, useCache=false }) {
  if (!url || !isSupportedProtocol(url)) {
    return;
  }

  let bookmarkInfoList;
  let source;

  if (useCache) {
    bookmarkInfoList = memo.cacheUrlToInfo.get(url);
    
    if (bookmarkInfoList) {
      source = SOURCE.CACHE;
      logBA('getBookmarkInfoUni OPTIMIZATION: from cache bookmarkInfo')
    }
  } 
  
  if (!bookmarkInfoList) {
    bookmarkInfoList = await getBookmarkInfo(url);
    source = SOURCE.ACTUAL;
    memo.cacheUrlToInfo.add(url, bookmarkInfoList);
  }

  return {
    bookmarkInfoList,
    source,
  };
}
