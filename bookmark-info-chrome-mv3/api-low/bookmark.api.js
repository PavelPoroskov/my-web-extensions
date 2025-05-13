
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
