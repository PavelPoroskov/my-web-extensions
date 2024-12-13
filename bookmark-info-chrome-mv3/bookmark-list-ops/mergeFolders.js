import {
    BOOKMARKS_BAR_FOLDER_ID,
    OTHER_BOOKMARKS_FOLDER_ID,
} from '../api/special-folder.api.js';
import {
    singular,
} from '../api/pluralize.js';
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
        const trimmedTitle = node.title.toLowerCase().trim()
        const wordList = trimmedTitle.replaceAll('-', ' ').split(/\s+/)
        const lastWord = wordList.at(-1)
        const singularLastWord = singular(lastWord)
        const normalizedWordList = wordList.with(-1, singularLastWord)
        const normalizedTitle = normalizedWordList.join(' ')

        if (!nameSet[normalizedTitle]) {
            nameSet[normalizedTitle] = [node]
        } else {
            nameSet[normalizedTitle].push(node)
        }
    }
    // console.log('### mergeSubFolder 11: nameSet', nameSet)

    const notUniqList = Object.entries(nameSet).filter(([, nodeList]) => nodeList.length > 1)
    const moveTaskList = []
    const renameTaskList = []
    for (const [, nodeList] of notUniqList) {
        const sortedList = nodeList.toSorted((a, b) => b.title.localeCompare(a.title))
        const [firstNode, ...restNodeList] = sortedList

        for (const fromNode of restNodeList) {
            moveTaskList.push({
                fromNode,
                toNode: firstNode, 
            })
        }

        const trimmedTitle = firstNode.title.trim()
        if (firstNode.title !== trimmedTitle) {
            renameTaskList.push({
                id: firstNode.id,
                title: trimmedTitle,
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


    const uniqList = Object.entries(nameSet).filter(([, nodeList]) => nodeList.length === 1)
    for (const [, nodeList] of uniqList) {
        const [firstNode] = nodeList
        
        const trimmedTitle = firstNode.title.trim()
        if (firstNode.title !== trimmedTitle) {
            renameTaskList.push({
                id: firstNode.id,
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
}