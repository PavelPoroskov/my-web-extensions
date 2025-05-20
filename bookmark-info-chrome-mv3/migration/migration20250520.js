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

function isOldDatedFolderTitle(str) {
  const partList = str.split(' ')

  if (!(4 <= partList.length)) {
    return false
  }

  const result = isWeekday(partList.at(-1)) && partList.at(-3).length == 3 && isDate(partList.at(-2)) && !!partList.at(-4)

  return result
}

function fromOldTitleToNewTitle(str) {
  const partList = str.split(' ')

  if (!(4 <= partList.length)) {
    return false
  }

  const weekday = partList.at(-1)
  const date = partList.at(-2)
  const order = partList.at(-3)
  const fixed = partList.slice(0, -3).join(' ')

  return `${fixed} ${date} ${weekday}.${order}`
}

export async function migration20250520() {

  const renameList = []

  async function onFolder({ folder, level }) {
    if (level < 2) {
      return
    }

    if (isOldDatedFolderTitle(folder.title)) {
      renameList.push({
        id: folder.id,
        title: fromOldTitleToNewTitle(folder.title),
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
