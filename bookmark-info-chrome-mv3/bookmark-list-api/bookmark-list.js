
export async function getBookmarkNodeList(idList) {
  if (!(Array.isArray(idList) && idList.length > 0)) {
    return []
  }

  let resultList

  try {
    resultList = await chrome.bookmarks.get(idList)

  // eslint-disable-next-line no-unused-vars
  } catch (_er) {
    const resultListByOne = await Promise.allSettled(
      idList.map(
        (id) => chrome.bookmarks.get(id)
      )
    )

    resultList = resultListByOne
      .map((result) => result.value)
      .filter(Boolean)
      .flat()
  }

  return resultList
}

export async function getBookmarkList(url) {
  if (url.startsWith('chrome:') || url.startsWith('about:')) {
    return []
  }

  const bookmarkList = await chrome.bookmarks.search({ url });

  return bookmarkList
}
