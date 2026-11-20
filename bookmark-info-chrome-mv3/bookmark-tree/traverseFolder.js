async function traverseFolderRecursively({ folder, onFolder, level }) {
  const childBookmarkList = []
  const childFolderList = []

  if (folder.children) {
    for (const child of folder.children) {
      if (child.url) {
        childBookmarkList.push(child)
      } else {
        childFolderList.push(child)
      }
    }
  }

  await onFolder({
    folder: {
      id: folder.id,
      title: folder.title,
      parentId: folder.parentId,
    },
    bookmarkList: childBookmarkList,
    folderListLength: childFolderList.length,
    level,
  })

  const nextLevel = level + 1
  await childFolderList.reduce(
    (promiseChain, childFolder) => promiseChain.then(
      () => traverseFolderRecursively({ folder: childFolder, onFolder, level: nextLevel })
    ),
    Promise.resolve(),
  );
}

export async function traverseTreeRecursively({ onFolder }) {

  const [rootFolder] = await chrome.bookmarks.getTree()
  await traverseFolderRecursively({ folder: rootFolder, onFolder, startLevel: 0 })
}

export async function traverseChildFoldersRecursively({ folderId, onFolder }) {
  if (!folderId) {
    return
  }

  const [rootFolder] = await chrome.bookmarks.getSubTree(folderId)
  const childFolderList = rootFolder.children
    .filter(({ url }) => !url)

  await childFolderList.reduce(
    (promiseChain, childFolder) => promiseChain.then(
      () => traverseFolderRecursively({ folder: childFolder, onFolder, level: 1 })
    ),
    Promise.resolve(),
  );
}

export async function traverseChildFolders({ folderId, onFolder }) {
  if (!folderId) {
    return
  }

  const [rootFolder] = await chrome.bookmarks.getSubTree(folderId)
  const childFolderList = rootFolder.children
    .filter(({ url }) => !url)

  await childFolderList.reduce(
    (promiseChain, childFolder) => promiseChain.then(
      async () => {
        const bookmarkList = childFolder.children
          .filter(({ url }) => !!url)

        return onFolder({
          folder: {
            id: childFolder.id,
            title: childFolder.title,
            parentId: childFolder.parentId,
          },
          bookmarkList,
        })
      }
    ),
    Promise.resolve(),
  );
}
