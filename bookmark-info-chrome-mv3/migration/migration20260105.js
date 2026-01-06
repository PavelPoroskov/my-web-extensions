import {
  isDate,
  isWeekday,
} from '../folder-api/index.js'
import {
  updateFolderIgnoreInController,
} from '../bookmark-controller-api/index.js'
import {
  traverseTreeRecursively,
} from '../bookmark-list-ops/index.js'

function isOldDatedFolderTitleNoDirective(str) {
  const partList = str.split(' ')

  if (!(4 <= partList.length)) {
    return false
  }

  const result = isWeekday(partList.at(-2)) && partList.at(-1).length == 3 && isDate(partList.at(-3)) && !!partList.at(-4)

  return result
}

function fromOldTitleToNewTitleWithDirective(str) {
  const partList = str.split(' ')

  if (!(4 <= partList.length)) {
    return false
  }

  const weekday = partList.at(-2)
  const date = partList.at(-3)
  const order = partList.at(-1)
  const fixed = partList.slice(0, -3).join(' ')

  return `${fixed} ${date} ${weekday} #o:${order}`
}

export async function migration20260105() {
  // dated folder new format: #o:

  const renameList = []

  async function onFolder({ folder, level }) {
    if (level < 2) {
      return
    }

    if (isOldDatedFolderTitleNoDirective(folder.title)) {
      renameList.push({
        id: folder.id,
        title: fromOldTitleToNewTitleWithDirective(folder.title),
      })
    }
  }

  await traverseTreeRecursively({ onFolder })

  await renameList.reduce(
    (promiseChain, { id, title }) => promiseChain.then(
      () => updateFolderIgnoreInController({ id,  title })
    ),
    Promise.resolve(),
  );
}
