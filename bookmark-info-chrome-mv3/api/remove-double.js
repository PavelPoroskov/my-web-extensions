import { ExtraMap } from './module.js'

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

export async function removeDoubleBookmark() {
  const doubleList = await getDoubles()
  // console.log('Double bookmarks:', doubleList.length)

  await Promise.all(
    doubleList.map(
      (id) => chrome.bookmarks.remove(id)
    )
  )

  return {
    nRemovedDoubles: doubleList.length
  }
}