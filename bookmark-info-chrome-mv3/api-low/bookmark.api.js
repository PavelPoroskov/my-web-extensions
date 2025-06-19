
// export async function getBookmarkList(idList) {
//   if (!(Array.isArray(idList) && idList.length > 0)) {
//     return []
//   }

//   const list = await chrome.bookmarks.get(idList)

//   return list
// }

export async function getBookmarkListDirty(idList) {
  if (!(Array.isArray(idList) && idList.length > 0)) {
    return []
  }

  const resultList = await Promise.allSettled(
    idList.map(
      (id) => chrome.bookmarks.get(id)
    )
  )

  return resultList
    .map((result) => result.value)
    .filter(Boolean)
    .flat()
}

export async function getBookmarkListWithParent({ url }) {
  if (url.startsWith('chrome:') || url.startsWith('about:')) {
    return []
  }

  const bookmarkList = await chrome.bookmarks.search({ url });

  const parentIdList = bookmarkList.map(({ parentId }) => parentId).filter(Boolean)
  const uniqueParentIdList = Array.from(new Set(parentIdList))
  let parentFolderList = []

  if (0 < uniqueParentIdList.length) {
    parentFolderList = await getBookmarkListDirty(uniqueParentIdList)
  }

  const parentMap = Object.fromEntries(
    parentFolderList
      .map(({ id, title }) => [id, title])
  )

  const resultList = bookmarkList
    .map((bookmark) => ({ parentTitle: parentMap[bookmark.parentId] || '', ...bookmark }))

  return resultList
}

