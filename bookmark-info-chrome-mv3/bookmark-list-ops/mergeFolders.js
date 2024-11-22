import {
    BOOKMARKS_BAR_FOLDER_ID,
    OTHER_BOOKMARKS_FOLDER_ID,
} from '../api/special-folder.api.js';
import {
    plural,
} from '../api/pluralize.js';

async function moveContent(fromFolderId, toFolderId) {
    const nodeList = await chrome.bookmarks.getChildren(fromFolderId)
    
    // await Promise.all(nodeList.map(
    //     ({ id }) => chrome.bookmarks.move(id, { parentId: toFolderId })
    // ))
    await Promise.all(nodeList.map(
        async ({ id, title, url }) => {
            await chrome.bookmarks.create({
                parentId: toFolderId,
                title,
                url
              })
            await chrome.bookmarks.remove(id)
        }
    ))
}

async function mergeSubFolder(parentId) {
    // console.log('### mergeSubFolder 00,', parentId)
    const nodeList = await chrome.bookmarks.getChildren(parentId)
  
    const filteredNodeList = nodeList
      .filter(({ url }) => !url)

    const nameSet = {}

    for (const node of filteredNodeList) {
        const trimmedTitle = node.title.toLowerCase().trim()
        const wordList = trimmedTitle.split(/\s+/)
        const lastWord = wordList.at(-1)
        const pluralLastWord = plural(lastWord)
        const normalizedWordList = wordList.with(-1, pluralLastWord)
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

    await Promise.all(renameTaskList.map(
        ({ id, title }) => chrome.bookmarks.update(id, { title })
    ))
}

export async function mergeFolders() {
    await mergeSubFolder(BOOKMARKS_BAR_FOLDER_ID)
    await mergeSubFolder(OTHER_BOOKMARKS_FOLDER_ID)
}