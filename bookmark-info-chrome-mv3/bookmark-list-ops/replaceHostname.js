import {
  updateBookmarkIgnoreInController,
} from '../bookmark-controller-api/index.js'
import {
  traverseTreeRecursively,
} from './traverseFolder.js'

async function getReplaceList({ originalHostname, newHostname }) {
  const taskList = []

  function onFolder({ bookmarkList }) {

    bookmarkList.forEach(({ url, id }) => {
      try {
        const oUrl = new URL(url)

        if (oUrl.hostname == originalHostname) {
          oUrl.hostname = newHostname

          taskList.push({
            id,
            newUrl: oUrl.toString(),
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
export async function replaceHostname({ originalHostname, newHostname }) {
  const replaceList = await getReplaceList({ originalHostname, newHostname })

  await replaceList.reduce(
    (promiseChain, { id, newUrl }) => promiseChain.then(
      () => updateBookmarkIgnoreInController({ id, url: newUrl })
    ),
    Promise.resolve(),
  );
}
