import {
  ExtraMap,
} from '../api-low/index.js'
import {
  removeBookmark,
} from '../bookmark-controller-api/index.js'

async function getDoubles() {
  const doubleList = []

  function traverseFolder(folderNode) {
    const childFolderList = []
    const urlToIdMap = new ExtraMap()

    if (folderNode.children) {
      for (const child of folderNode.children) {
        if (child.url) {
          const { url, id, title } = child
          urlToIdMap.concat(url, { id, title })
        } else {
          childFolderList.push(child)
        }
      }
    }

   for (const idList of urlToIdMap.values()) {
      if (1 < idList.length) {
        const titleToIdMap = new ExtraMap()

        idList.forEach(({ id, title }) => {
          titleToIdMap.concat(title, id)
        })

        for (const idList of titleToIdMap.values()) {
          if (1 < idList.length) {
            idList
              .slice(1)
              .forEach(
                (id) => doubleList.push(id)
              )
          }
        }
      }
    }

    for (const childFolder of childFolderList) {
      traverseFolder(childFolder)
    }
  }

  const [rootFolder] = await chrome.bookmarks.getTree()
  traverseFolder(rootFolder)

  return doubleList
}

export async function removeDoubleBookmarks() {
  const doubleList = await getDoubles()
  // console.log('Double bookmarks:', doubleList.length)

  await doubleList.reduce(
    (promiseChain, bkmId) => promiseChain.then(
      () => removeBookmark(bkmId)
    ),
    Promise.resolve(),
  );

  return {
    nRemovedDoubles: doubleList.length
  }
}
