import {
    BOOKMARKS_BAR_FOLDER_ID,
    OTHER_BOOKMARKS_FOLDER_ID,
} from '../api/special-folder.api.js';

function isStartWithTODO(str) {
    return !!str && str.slice(0, 4).toLowerCase() === 'todo'
}

async function moveFolderByName({ fromId, toId, isCondition }) {
    const childrenList = await chrome.bookmarks.getChildren(fromId)
    const moveList = childrenList
      .filter(({ url }) => !url)
      .filter(({ title }) => isCondition(title))

    await Promise.all(
      moveList.map(
        (node) => chrome.bookmarks.move(node.id, { parentId: toId })
      )
    ) 
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