import {
  updateBookmarkIgnoreInController,
} from '../bookmark-controller-api/index.js'
import {
  traverseTreeRecursively,
} from './traverseFolder.js'


async function getReplaceList({ originalHostname, newHostname, getNewUrl }) {
  const taskList = []

  function onFolder({ bookmarkList }) {

    bookmarkList.forEach(({ url, id }) => {
      try {
        const oUrl = new URL(url)

        if (oUrl.hostname == originalHostname) {

          let newUrl

          if (getNewUrl) {
            newUrl = getNewUrl(url)
          } else {
            oUrl.hostname = newHostname
            newUrl = oUrl.toString()
          }

          taskList.push({
            id,
            newUrl,
          })
        }

      // eslint-disable-next-line no-empty
      } finally {

      }
    })
  }

  await traverseTreeRecursively({ onFolder })

  return taskList
}

// eslint-disable-next-line no-unused-vars
export async function replaceHostname({ originalHostname, newHostname, getNewUrl }) {
  const replaceList = await getReplaceList({ originalHostname, newHostname, getNewUrl })

  await replaceList.reduce(
    (promiseChain, { id, newUrl }) => promiseChain.then(
      () => updateBookmarkIgnoreInController({ id, url: newUrl })
    ),
    Promise.resolve(),
  );
}
