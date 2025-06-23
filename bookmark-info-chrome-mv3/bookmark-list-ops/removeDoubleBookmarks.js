import {
  ExtraMap,
} from '../api-low/index.js'
import {
  removeBookmark,
} from '../bookmark-controller-api/index.js'
import {
  traverseTreeRecursively,
} from './traverseFolder.js'

async function getDoubles() {
  const doubleList = []

  function onFolder({ bookmarkList }) {
    const urlToIdMap = new ExtraMap()

    bookmarkList.forEach(({ url, id, title }) => {
      urlToIdMap.concat(url, { id, title })
    })

    for (const idList of urlToIdMap.values()) {
      if (1 < idList.length) {
        const titleToIdMap = new ExtraMap()

        idList.forEach(({ id, title }) => {
          titleToIdMap.concat(title, id)
        })

        for (const idList2 of titleToIdMap.values()) {
          if (1 < idList2.length) {
            idList2
              .slice(1)
              .forEach(
                (id) => doubleList.push(id)
              )
          }
        }
      }
    }
  }

  await traverseTreeRecursively({ onFolder })

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
