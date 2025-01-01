import {
  tagList,
} from '../data-structures/index.js'

export async function addRecentTagFromView(bookmarkId) {
  if (!bookmarkId) {
    return
  }

  const [bkmNode] = await chrome.bookmarks.get(bookmarkId)
  await tagList.addRecentTagFromBkm(bkmNode)
}
