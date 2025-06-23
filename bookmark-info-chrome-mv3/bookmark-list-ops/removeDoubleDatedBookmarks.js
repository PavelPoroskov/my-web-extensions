import {
  ExtraMap,
} from '../api-low/index.js'
import {
  removeBookmark,
} from '../bookmark-controller-api/index.js'
import {
  traverseTreeRecursively,
} from './traverseFolder.js'
import {
  compareDatedTitle,
  getDatedTemplate,
  isDatedFolderTitle,
} from '../folder-api/index.js'

async function getDated() {
  const datedList = []

  function onFolder({ folder, bookmarkList }) {
    if (isDatedFolderTitle(folder.title)) {
      bookmarkList.forEach(({ url, id }) => {
        datedList.push({ id, url, parentTitle: folder.title })
      })
    }
  }

  await traverseTreeRecursively({ onFolder })

  return datedList
}

async function getDoubleDated() {
  const datedList = await getDated()
  const doubleList = []

  const urlToIdMap = new ExtraMap()

  datedList.forEach(({ url, id, parentTitle }) => {
    urlToIdMap.concat(url, { id, parentTitle })
  })

  for (const idList of urlToIdMap.values()) {
    if (1 < idList.length) {
      const datedTemplateToIdMap = new ExtraMap()

      idList.forEach(({ id, parentTitle }) => {
        const datedTemplate = getDatedTemplate(parentTitle)
        datedTemplateToIdMap.concat(datedTemplate, { id, parentTitle })
      })

      for (const idList2 of datedTemplateToIdMap.values()) {
        if (1 < idList2.length) {
          idList2
            .toSorted((a,b) => compareDatedTitle(a.parentTitle, b.parentTitle))
            .slice(1)
            .forEach(
              ({ id }) => doubleList.push(id)
            )
        }
      }
    }
  }

  return doubleList
}

export async function removeDoubleDatedBookmarks() {
  const doubleList = await getDoubleDated()

  await doubleList.reduce(
    (promiseChain, bkmId) => promiseChain.then(
      () => removeBookmark(bkmId)
    ),
    Promise.resolve(),
  );
}
