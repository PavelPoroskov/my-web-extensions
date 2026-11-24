// used in ../api-mid/tagList-getRecent/getRecentList()
// used in ../api-mid/tagList-getRecent/filterFolders()
// ../bookmark-search/getParentFolderList()
// addBookmarkParentInfo() -> getBookmarkListWithParent() -> ../api/urlEvents._removeBookmarksByPatterns()
export async function getBookmarkNodeList(idList) {
  if (!(Array.isArray(idList) && idList.length > 0)) {
    return []
  }

  let resultList

  try {
    resultList = await chrome.bookmarks.get(idList)

  // eslint-disable-next-line no-unused-vars
  } catch (_er) {
    const resultListByOne = await Promise.allSettled(
      idList.map(
        (id) => chrome.bookmarks.get(id)
      )
    )

    resultList = resultListByOne
      .map((result) => result.value)
      .filter(Boolean)
      .flat()
  }

  return resultList
}

export const getParentIdList = (bookmarkList = []) => {
  const parentIdList = bookmarkList
    .map(({ parentId }) => parentId)
    .filter(Boolean)

  return Array.from(new Set(parentIdList))
}

async function addBookmarkParentInfo(bookmarkList) {
  const parentIdList = getParentIdList(bookmarkList)
  const parentFolderList = await getBookmarkNodeList(parentIdList)

  const parentMap = Object.fromEntries(
    parentFolderList
      .map(({ id, title }) => [id, title])
  )

  const resultList = bookmarkList
    .map((bookmark) => ({
      parentTitle: parentMap[bookmark.parentId] || '',
      ...bookmark
    }))

  return resultList
}

export async function getBookmarkListWithParent(url) {
  if (url.startsWith('chrome:') || url.startsWith('about:')) {
    return []
  }

  const bookmarkList = await chrome.bookmarks.search({ url });
  // add { parentTitle }
  const listWithParent = await addBookmarkParentInfo(bookmarkList)

  return listWithParent
}
