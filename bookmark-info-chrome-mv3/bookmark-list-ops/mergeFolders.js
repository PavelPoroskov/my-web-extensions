import {
    BOOKMARKS_BAR_FOLDER_ID,
    OTHER_BOOKMARKS_FOLDER_ID,
} from '../api/special-folder.api.js';

async function moveContent(fromFolderId, toFolderId) {
    const nodeList = await chrome.bookmarks.getChildren(fromFolderId)
    
    await Promise.all(nodeList.map(
      ({ id }) => chrome.bookmarks.move(id, { parentId: toFolderId }))
    )
}

async function mergeSubFolder(parentId) {
    const nodeList = await chrome.bookmarks.getChildren(parentId)
  
    const filteredNodeList = nodeList
      .filter(({ url }) => !url)

    const nameSet = {}

    for (const node of filteredNodeList) {
        const name = node.title.toLowerCase().trim()

        if (!nameSet[name]) {
            nameSet[name] = [node]
        } else {
            nameSet[name].push(node)
        }
    }

    const notUniqList = Object.entries(nameSet).filter(([, nodeList]) => nodeList.length > 1)
    const taskList = []
    for (const [, nodeList] of notUniqList) {
        const sortedList = nodeList.toSorted((a, b) => a.title.localeCompare(b.title))
        const [firstNode, ...restNodeList] = sortedList

        for (const fromNode of restNodeList) {
            taskList.push({ fromNode, toNode: firstNode })
        }
    }

    await taskList.reduce(
        (promiseChain, { fromNode, toNode }) => promiseChain.then(() => moveContent(fromNode.id, toNode.id)),
        Promise.resolve(),
    );
    
    await Promise.all(taskList.map(
        ({ fromNode }) => chrome.bookmarks.remove(fromNode.id)
    ))
}

export async function mergeFolders() {
    await mergeSubFolder(BOOKMARKS_BAR_FOLDER_ID)
    await mergeSubFolder(OTHER_BOOKMARKS_FOLDER_ID)
}