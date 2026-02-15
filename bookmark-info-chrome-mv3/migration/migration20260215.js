import {
  isDate,
} from '../folder-api/index.js'
import {
  updateFolderIgnoreInController,
} from '../bookmark-controller-api/index.js'
import {
  traverseTreeRecursively,
} from '../bookmark-list-ops/index.js'
import {
  isWeekday,
} from './migration.unit.js'


function isOldDatedFolderTitleWithWeekday(str) {
  const partList = str.split(' ')

  if (!(4 <= partList.length)) {
    return false
  }

  const fixed = partList.slice(0, -3).join(' ')
  const date = partList.at(-3)
  const weekday = partList.at(-2)
  const order = partList.at(-1)

  return order.startsWith('#o:') && isWeekday(weekday) && isDate(date) && !!fixed
}

function fromOldTitleToNewTitleWithoutWeekday(str) {
  const partList = str.split(' ')

  if (!(4 <= partList.length)) {
    return false
  }

  const fixed = partList.slice(0, -3).join(' ')
  const date = partList.at(-3)
  const order = partList.at(-1)

  return `${fixed} ${date} ${order}`
}

export async function migration20260215() {
  const renameList = []

  async function onFolder({ folder, level }) {
    if (level < 2) {
      return
    }

    if (isOldDatedFolderTitleWithWeekday(folder.title)) {
      renameList.push({
        id: folder.id,
        title: fromOldTitleToNewTitleWithoutWeekday(folder.title),
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
