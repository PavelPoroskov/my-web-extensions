import {
  tagList,
} from '../structure/index.js'

export async function addRecentTagFromView(bookmarkId) {
  const [bkmNode] = await chrome.bookmarks.get(bookmarkId)
  await tagList.addRecentTagFromBkm(bkmNode)
}
