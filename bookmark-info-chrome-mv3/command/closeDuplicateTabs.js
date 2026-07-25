function getUniqueTabList(tabList) {
  const urlToTabList = new Map();
  const validTabList = [];

  tabList
    .forEach((Tab) => {
      const url = Tab.pendingUrl || Tab.url || '';
      const tabListForUrl = urlToTabList.get(url) || [];

      tabListForUrl.push(Tab)
      urlToTabList.set(url, tabListForUrl);
    });

  urlToTabList.values()
    .forEach(tabListForUrl => {

      if (tabListForUrl.length === 1) {
        validTabList.push(tabListForUrl[0])
      } else {
        const hasFixedTab = tabListForUrl.some((Tab) => Tab.pinned || Tab.active)

        if (hasFixedTab) {
          const fixedTabList = tabListForUrl.filter((Tab) => Tab.pinned || Tab.active)
          validTabList.push(...fixedTabList)
        } else {
          const sortedTabList = tabListForUrl.toSorted((a, b) => a.index - b.index)
          validTabList.push(sortedTabList.at(-1))
        }
      }
    })

  return validTabList
}

export async function closeDuplicateTabs() {
  const tabList = await chrome.tabs.query({ lastFocusedWindow: true });
  const validTabList = getUniqueTabList(tabList);
  const validTabIdSet = new Set(
    validTabList
      .map(Tab => Tab.id)
      .filter(Boolean)
  )
  console.log()
  const duplicateTabList = tabList.filter(Tab => !validTabIdSet.has(Tab.id))

  const duplicateTabIdList = duplicateTabList
    .map(Tab => Tab.id)
    .filter(Boolean)

  if (0 < duplicateTabIdList.length) {
    await chrome.tabs.remove(duplicateTabIdList)
  }
}
