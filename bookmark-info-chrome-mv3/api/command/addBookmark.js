export async function addBookmark({ url, title, parentId }) {
  const bookmarkList = await chrome.bookmarks.search({ url });
  const isExist = bookmarkList.some((bkm) => bkm.parentId == parentId)
  if (isExist) {
    return
  }

  await chrome.bookmarks.create({
    index: 0,
    parentId,
    title,
    url
  })
}