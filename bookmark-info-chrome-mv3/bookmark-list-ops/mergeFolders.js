import {
    BOOKMARKS_BAR_FOLDER_ID,
    OTHER_BOOKMARKS_FOLDER_ID,
} from '../api/special-folder.api.js';
import {
    normalizeTitle,
    trimTitle,
} from '../api/text.api.js';
import {
    ignoreBkmControllerApiActionSet,
} from '../api/structure/ignoreBkmControllerApiActionSet.js';

async function moveContent(fromFolderId, toFolderId) {
    const nodeList = await chrome.bookmarks.getChildren(fromFolderId)
    
    nodeList.forEach(({ id: bookmarkId }) => {
        ignoreBkmControllerApiActionSet.addIgnoreMove(bookmarkId)
    })

    await Promise.all(nodeList.map(
        ({ id }) => chrome.bookmarks.move(id, { parentId: toFolderId })
    ))
}

async function mergeSubFolder(parentId) {
    // console.log('### mergeSubFolder 00,', parentId)
    const nodeList = await chrome.bookmarks.getChildren(parentId)
    const folderNodeList = nodeList.filter(({ url }) => !url)
    const nameSet = {}

    for (const node of folderNodeList) {
        const normalizedTitle = normalizeTitle(node.title)

        if (!nameSet[normalizedTitle]) {
            nameSet[normalizedTitle] = [node]
        } else {
            nameSet[normalizedTitle].push(node)
        }
    }
    // console.log('### mergeSubFolder 11: nameSet', nameSet)

    const notUniqList = Object.entries(nameSet).filter(([, nodeList]) => nodeList.length > 1)
    const moveTaskList = []
    for (const [, nodeList] of notUniqList) {
        const sortedList = nodeList.toSorted((a, b) => -a.title.localeCompare(b.title))
        const [firstNode, ...restNodeList] = sortedList

        for (const fromNode of restNodeList) {
            moveTaskList.push({
                fromNode,
                toNode: firstNode, 
            })
        }
    }
    // console.log('### moveTaskList', moveTaskList.map(({ fromNode, toNode }) => `${fromNode.title} -> ${toNode.title}`))

    await moveTaskList.reduce(
        (promiseChain, { fromNode, toNode }) => promiseChain.then(() => moveContent(fromNode.id, toNode.id)),
        Promise.resolve(),
    );
    
    await Promise.all(moveTaskList.map(
        ({ fromNode }) => chrome.bookmarks.removeTree(fromNode.id)
    ))
}

async function trimTitleInSubFolder(parentId) {
    const nodeList = await chrome.bookmarks.getChildren(parentId)
    const folderNodeList = nodeList.filter(({ url }) => !url)

    const renameTaskList = []
    for (const folderNode of folderNodeList) {

        const trimmedTitle = trimTitle(folderNode.title)
        if (folderNode.title !== trimmedTitle) {
            renameTaskList.push({
                id: folderNode.id,
                title: trimmedTitle,
            })
        }
    }

    await Promise.all(renameTaskList.map(
        ({ id, title }) => chrome.bookmarks.update(id, { title })
    ))
}

export async function mergeFolders() {
    await mergeSubFolder(BOOKMARKS_BAR_FOLDER_ID)
    await mergeSubFolder(OTHER_BOOKMARKS_FOLDER_ID)

    await trimTitleInSubFolder(BOOKMARKS_BAR_FOLDER_ID)
    await trimTitleInSubFolder(OTHER_BOOKMARKS_FOLDER_ID)
}