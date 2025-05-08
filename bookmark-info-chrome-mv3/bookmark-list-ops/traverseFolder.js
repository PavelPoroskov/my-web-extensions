
export async function traverseFolderRecursively({ folder: rootFolder, onFolder, startLevel=0 }) {
  async function traverseFolder({ folder, level }) {
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
      folder,
      bookmarkList: childBookmarkList,
      folderListLength: childFolderList.length,
      level,
    })

    const nextLevel = level + 1
    await childFolderList.reduce(
      (promiseChain, childFolder) => promiseChain.then(
        () => traverseFolder({ folder: childFolder, level: nextLevel })
      ),
      Promise.resolve(),
    );
  }

  await traverseFolder({ folder: rootFolder, level: startLevel })
}
