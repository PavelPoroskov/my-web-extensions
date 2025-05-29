import {
  updateBookmarkIgnoreInController,
} from '../bookmark-controller-api/index.js'
import {
  traverseTreeRecursively,
} from './traverseFolder.js'

async function getReplaceList({ originalHost, newHost }) {
  const taskList = []

  function onFolder({ bookmarkList }) {

    bookmarkList.forEach(({ url, id }) => {
      try {
        const oUrl = new URL(url)

        if (oUrl.hostname == originalHost) {
          oUrl.hostname = newHost

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
export async function replaceHostname() {
  const originalHost = 'name1.xyz';
  const newHost = 'name1.xy';
  const replaceList = await getReplaceList({ originalHost, newHost })

  await replaceList.reduce(
    (promiseChain, { id, newUrl }) => promiseChain.then(
      () => updateBookmarkIgnoreInController({ id, url: newUrl })
    ),
    Promise.resolve(),
  );
}
