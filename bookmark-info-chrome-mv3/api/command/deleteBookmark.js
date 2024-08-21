export async function deleteBookmark(bkmId) {
  await chrome.bookmarks.remove(bkmId);
}
