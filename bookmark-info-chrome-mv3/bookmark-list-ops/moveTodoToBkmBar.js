import {
  BOOKMARKS_BAR_FOLDER_ID,
  OTHER_BOOKMARKS_FOLDER_ID,
} from '../api/special-folder.api.js';
import {
  isStartWithTODO,
} from '../api/text.api.js';
import {
  moveBookmark,
} from '../api/bookmark.api.js';

export async function moveFolderByName({ fromId, toId, isCondition }) {
  const childrenList = await chrome.bookmarks.getChildren(fromId)
  let moveList = childrenList
    .filter(({ url }) => !url)

  if (isCondition) {
    moveList = moveList.filter(({ title }) => isCondition(title))
  }

  await moveList.reduce(
    (promiseChain, node) => promiseChain.then(
      () => moveBookmark({ id: node.id, parentId: toId })
    ),
    Promise.resolve(),
  );
}

export async function moveTodoToBkmBar() {
  await moveFolderByName({
    fromId: BOOKMARKS_BAR_FOLDER_ID,
    toId: OTHER_BOOKMARKS_FOLDER_ID,
    isCondition: (title) => !isStartWithTODO(title)
  })
  await moveFolderByName({
    fromId: OTHER_BOOKMARKS_FOLDER_ID,
    toId: BOOKMARKS_BAR_FOLDER_ID,
    isCondition: (title) => isStartWithTODO(title)
  })
}
