let lastCreatedBkmParentId
let lastCreatedBkmUrl

export async function createBookmarkInCommonFolder({
  parentId,
  title,
  url
}) {
  const bookmarkList = await chrome.bookmarks.search({ url });
  const isExist = bookmarkList.some((bkm) => bkm.parentId == parentId)
  if (isExist) {
    return
  }

  lastCreatedBkmParentId = parentId
  lastCreatedBkmUrl = url

  return await chrome.bookmarks.create({
    index: 0,
    parentId,
    title,
    url
  })
}

export function isBookmarkCreatedWithApi({ parentId, url }) {
  return parentId == lastCreatedBkmParentId && url == lastCreatedBkmUrl
}

