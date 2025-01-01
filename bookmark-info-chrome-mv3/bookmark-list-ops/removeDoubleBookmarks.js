import {
  ExtraMap,
} from '../data-structures/index.js'
import {
  removeBookmarkIgnoreInController,
} from '../api/bookmark.api.js'

async function getDoubles() {
  const doubleList = []

  async function traverseNodeList(nodeList) {
    const urlToIdMap = new ExtraMap()
    nodeList
      .filter(({ url }) => !!url)
      .forEach(({ id, url, title }) => {
        urlToIdMap.concat(url, { id, title })
      })

    for (const idList of urlToIdMap.values()) {
      if (idList.length > 1) {
        const titleToIdMap = new ExtraMap()

        idList.forEach(({ id, title }) => {
          titleToIdMap.concat(title, id)
        })

        for (const idList of titleToIdMap.values()) {
          if (idList.length > 1) {
            idList
              .slice(1)
              .forEach(
                (id) => doubleList.push(id)
              )
          }
        }
      }
    }

    nodeList
      .filter(({ url }) => !url)
      .map(
        (node) => traverseNodeList(node.children)
      )
  }

  const nodeList = await chrome.bookmarks.getTree()
  traverseNodeList(nodeList)

  return doubleList
}

export async function removeDoubleBookmarks() {
  const doubleList = await getDoubles()
  // console.log('Double bookmarks:', doubleList.length)

  await doubleList.reduce(
    (promiseChain, bkmId) => promiseChain.then(
      () => removeBookmarkIgnoreInController(bkmId)
    ),
    Promise.resolve(),
  );

  return {
    nRemovedDoubles: doubleList.length
  }
}
