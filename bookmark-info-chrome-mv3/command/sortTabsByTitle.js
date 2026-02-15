
export async function sortTabsByTitle() {
  const tabs = await chrome.tabs.query({ lastFocusedWindow: true });
  const tabsWithId = tabs.filter(({ id }) => id);

  const firstUnpinnedTab = tabsWithId.find((tab) => !tab.pinned)

  if (!firstUnpinnedTab) {
    return
  }

  const iFirstUnpinnedTab = firstUnpinnedTab.index
  const unpinnedTabList = tabsWithId.slice(iFirstUnpinnedTab)
  unpinnedTabList.sort((a,b) => (a.title || '').localeCompare((b.title || '')))

  await chrome.tabs.move(
    unpinnedTabList.map(({ id }) => id),
    { index: iFirstUnpinnedTab }
  )
}
