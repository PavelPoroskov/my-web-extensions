import {
  BOOKMARKS_BAR_FOLDER_ID,
  BOOKMARKS_MENU_FOLDER_ID,
} from './special-folder.api.js';
import {
  findFolderWithExactTitle,
} from './find-folder.api.js'
import {
  createFolderIgnoreInController,
} from './folder.api.js'
import {
  makeLogFunction,
} from '../api-low/index.js';
import {
  tagList,
} from '../data-structures/index.js';

const logFD = makeLogFunction({ module: 'folder-dated.js' })

const dateFormatter = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric'})
const weekdayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'short' })
const futureDate = new Date('01/01/2125')
const oneDayMs = 24*60*60*1000

export function isDatedFolderTemplate(folderTitle) {
  return folderTitle.endsWith(' @D') && 3 < folderTitle.length
}

function getDatedTitle(folderTitle) {
  const fixedPart = folderTitle.slice(0, -3).trim()

  const today = new Date()
  const sToday = dateFormatter.format(today).replaceAll('/', '-')
  const sWeekday = weekdayFormatter.format(today)

  const days = Math.floor((futureDate - today)/oneDayMs)
  const sDays = new Number(days).toString(36).padStart(3,'0')

  return `${fixedPart} ${sDays} ${sToday} ${sWeekday}`
}

// folderTitle = 'DONE @D' 'selected @D' 'BEST @D'
export async function getDatedFolder(folderNode) {
  if (!isDatedFolderTemplate(folderNode.title)) {
    return
  }
  logFD('getDatedFolder () 00', folderNode.title)

  const datedTitle = getDatedTitle(folderNode.title)
  logFD('getDatedFolder () 11', 'datedTitle', datedTitle)
  const rootId = BOOKMARKS_MENU_FOLDER_ID || BOOKMARKS_BAR_FOLDER_ID
  let foundFolder = await findFolderWithExactTitle({ title: datedTitle, rootId })

  if (!foundFolder) {
    const firstLevelNodeList = await chrome.bookmarks.getChildren(rootId)
    const findIndex = firstLevelNodeList.find((node) => datedTitle.localeCompare(node.title) < 0)

    const folderParams = {
      parentId: rootId,
      title: datedTitle,
    }

    if (findIndex) {
      folderParams.index = findIndex.index
    }

    foundFolder = await createFolderIgnoreInController(folderParams)
  }
  await tagList.addRecentTagFromFolder(folderNode)


  return foundFolder
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
  logFD('isDatedFolderTitle () 00', str)

  const partList = str.split(' ')

  if (!(4 <= partList.length)) {
    return false
  }

  const result = !!partList.at(-4) && partList.at(-3).length == 3 && isDate(partList.at(-2)) && weekdaySet.has(partList.at(-1))
  // logFD('isDatedFolderTitle () 11', result)
  // logFD('isDatedFolderTitle () 11', partList, partList)
  // logFD('isDatedFolderTitle () 11', '!!partList.at(-4)', !!partList.at(-4))
  // logFD('isDatedFolderTitle () 11', 'partList.at(-3).length == 3', partList.at(-3).length == 3)
  // logFD('isDatedFolderTitle () 11', 'isDate(partList.at(-2))', isDate(partList.at(-2)))
  // logFD('isDatedFolderTitle () 11', 'weekdaySet.has(partList.at(-1)', weekdaySet.has(partList.at(-1)))

  return result
}

// export function isActualDatedFolderTitle(str) {
//   const partList = str.split(' ')

//   if (!(4 <= partList.length)) {
//     return false
//   }

//   const sD = partList.at(-2)

//   new Date(year, monthIndex, day)

// }
