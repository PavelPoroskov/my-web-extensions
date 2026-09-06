import {
  updateBookmarkIgnoreInController,
} from '../bookmark-controller-api/index.js'
import {
  traverseTreeRecursively,
} from './traverseFolder.js'

async function getUpdateList(fnGetUpdateForBookmark) {
  const taskList = []

  function onFolder({ bookmarkList }) {
    bookmarkList.forEach(({ id, url, title }) => {
      const bkmUpdate = fnGetUpdateForBookmark({ url, title })

      if (bkmUpdate?.url || bkmUpdate?.title) {
        taskList.push({
          id,
          url: bkmUpdate.url,
          title: bkmUpdate.title,
        })
      }
    })
  }

  await traverseTreeRecursively({ onFolder })

  return taskList
}

export async function updateBookmarks(fnGetUpdateForBookmark) {
  const updateList = await getUpdateList(fnGetUpdateForBookmark)

  await updateList.reduce(
    (promiseChain, { id, url, title }) => promiseChain.then(
      () => updateBookmarkIgnoreInController({ id, url, title })
    ),
    Promise.resolve(),
  );
}
