
let lastCreatedBkmParentId
let lastCreatedBkmUrl

export async function createBookmarkWithApi({
  index,
  parentId,
  title,
  url
}) {
  lastCreatedBkmParentId = parentId
  lastCreatedBkmUrl = url

  return await chrome.bookmarks.create({
    index,
    parentId,
    title,
    url
  })
}

export function isBookmarkCreatedWithApi({ parentId, url }) {
  return parentId == lastCreatedBkmParentId && url == lastCreatedBkmUrl
}
