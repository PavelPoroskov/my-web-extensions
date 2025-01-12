import {
  singular,
} from '../api-low/index.js';

export const isDescriptiveFolderTitle = (title) => !!title
  && !(
    title.startsWith('New folder')
    || title.startsWith('[Folder Name]')
    || title.startsWith('New Folder')
    || title.startsWith('(to title)')
  )

export const trimTitle = (title) => title
  .trim()
  .replace(/\s+/, ' ')

export const trimLow = (title) => {
  const trimmedTitle = title
    .trim()
    .replace(/\s+/, ' ')
    .toLowerCase()

  return trimmedTitle
}

export const trimLowSingular = (title) => {
  const trimmedTitle = trimLow(title)

  const wordList = trimmedTitle.split(' ')
  const lastWord = wordList.at(-1)
  const singularLastWord = singular(lastWord)
  const normalizedWordList = wordList.with(-1, singularLastWord)
  const normalizedTitle = normalizedWordList.join(' ')

  return normalizedTitle
}

export const normalizeTitle = (title) => trimLowSingular(title.replaceAll('-', ''))

export function isStartWithTODO(str) {
  return !!str && str.slice(0, 4).toLowerCase() === 'todo'
}

export function isDatedTemplateFolder(folderTitle) {
  return folderTitle.endsWith(' @D') && 3 < folderTitle.length
}

const inRange = ({ n, from, to }) => {
  if (!Number.isInteger(n)) {
    return false
  }

  if (from != undefined && !(from <= n)) {
    return false
  }

  if (to != undefined && !(n <= to)) {
    return false
  }

  return true
}

const isDate = (str) => {
  const partList = str.split('-')

  if (!(partList.length == 3)) {
    return false
  }

  const D = parseInt(partList.at(-3), 10)
  const M = parseInt(partList.at(-2), 10)
  const Y = parseInt(partList.at(-1), 10)

  return inRange({ n: D, from: 1, to: 31 }) && inRange({ n: M, from: 1, to: 12 }) && inRange({ n: Y, from: 2025 })
}

const weekdaySet = new Set(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'])

export function isDatedFolderTitle(str) {
  const partList = str.split(' ')

  if (!(4 <= partList.length)) {
    return false
  }

  // const result = !!partList.at(-4) && partList.at(-3).length == 3 && isDate(partList.at(-2)) && weekdaySet.has(partList.at(-1))
  const result = weekdaySet.has(partList.at(-1)) && partList.at(-3).length == 3 && isDate(partList.at(-2)) && !!partList.at(-4)
  // logFD('isDatedFolderTitle () 11', result)
  // logFD('isDatedFolderTitle () 11', partList, partList)
  // logFD('isDatedFolderTitle () 11', '!!partList.at(-4)', !!partList.at(-4))
  // logFD('isDatedFolderTitle () 11', 'partList.at(-3).length == 3', partList.at(-3).length == 3)
  // logFD('isDatedFolderTitle () 11', 'isDate(partList.at(-2))', isDate(partList.at(-2)))
  // logFD('isDatedFolderTitle () 11', 'weekdaySet.has(partList.at(-1)', weekdaySet.has(partList.at(-1)))

  return result
}
