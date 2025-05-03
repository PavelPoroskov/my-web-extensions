
export function traverseFolderRecursively({ folder: rootFolder, onFolder, startLevel=0 }) {
  function traverseFolder({ folder, level }) {
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

    onFolder({ folder, bookmarkList: childBookmarkList, level })

    const nextLevel = level + 1
    for (const childFolder of childFolderList) {
      traverseFolder({ folder: childFolder, level: nextLevel })
    }
  }

  traverseFolder({ folder: rootFolder, level: startLevel })
}
