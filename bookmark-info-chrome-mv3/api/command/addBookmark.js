export async function addBookmark({ url, title, parentId }) {
  await chrome.bookmarks.create({
    index: 0,
    parentId,
    title,
    url
  })
}