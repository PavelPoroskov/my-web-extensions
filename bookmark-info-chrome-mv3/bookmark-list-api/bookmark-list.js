
// export async function getBookmarkNodeList0(idList) {
//   if (!(Array.isArray(idList) && idList.length > 0)) {
//     return []
//   }

//   const list = await chrome.bookmarks.get(idList)

//   return list
// }

export async function getBookmarkNodeList(idList) {
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

export async function getBookmarkList(url) {
  if (url.startsWith('chrome:') || url.startsWith('about:')) {
    return []
  }

  const bookmarkList = await chrome.bookmarks.search({ url });

  return bookmarkList
}
