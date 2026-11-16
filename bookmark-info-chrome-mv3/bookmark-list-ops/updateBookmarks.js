import {
  updateBookmarkIgnoreInController,
} from '../bookmark-controller-api/index.js'
import {
  traverseTreeRecursively,
} from './traverseFolder.js'

async function getUpdateList({ getUpdateForBookmark }) {
  const taskList = []

  function onFolder({ bookmarkList }) {
    bookmarkList.forEach(({ id, url, title }) => {
      const bkmUpdate = getUpdateForBookmark({ url, title })

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

// eslint-disable-next-line no-unused-vars
export async function updateBookmarks({ getUpdateForBookmark }) {
  const updateList = await getUpdateList({ getUpdateForBookmark })

  await updateList.reduce(
    (promiseChain, { id, url, title }) => promiseChain.then(
      () => updateBookmarkIgnoreInController({ id, url, title })
    ),
    Promise.resolve(),
  );
}
