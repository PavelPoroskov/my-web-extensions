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
  isDatedFolderTitle,
  isDatedTemplateFolder,
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
  if (!isDatedTemplateFolder(folderNode.title)) {
    return
  }
  logFD('getDatedFolder () 00', folderNode.title)

  const datedTitle = getDatedTitle(folderNode.title)
  logFD('getDatedFolder () 11', 'datedTitle', datedTitle)
  const rootId = BOOKMARKS_MENU_FOLDER_ID || BOOKMARKS_BAR_FOLDER_ID
  let foundFolder = await findFolderWithExactTitle({ title: datedTitle, rootId })

  if (!foundFolder) {
    const firstLevelNodeList = await chrome.bookmarks.getChildren(rootId)
    const findIndex = firstLevelNodeList.find((node) => !node.url && datedTitle.localeCompare(node.title) < 0)

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

export function isDatedTitleForTemplate({ title, template }) {
  logFD('isDatedTitleForTemplate () 00', title, template)


  if (!isDatedTemplateFolder(template)) {
    return
  }
  if (!isDatedFolderTitle(title)) {
    return false
  }

  const fixedPartFromTitle = title.split(' ').slice(0, -3).join(' ')
  const fixedPartFromTemplate = template.slice(0, -3).trim()

  return fixedPartFromTitle == fixedPartFromTemplate
}

export async function removePreviousDatedBookmarks({ url, template }) {
  const bookmarkList = await chrome.bookmarks.search({ url });
  logFD('removePreviousDatedBookmarks () 00', bookmarkList)

  const parentFolderArList = await Promise.all(
    bookmarkList.map(
      ({ parentId }) => chrome.bookmarks.get(parentId)
    )
  )
  const parentMap = Object.fromEntries(
    parentFolderArList.flat()
      .map(({ id, title}) => [id, title])
  )

  const removeFolderList = bookmarkList
    .map(({ id, parentId }) => ({ id, parentTitle: parentMap[parentId] }))
    .filter(({ parentTitle }) => isDatedTitleForTemplate({ title: parentTitle, template }))
    .toSorted((a,b) => a.parentTitle.localeCompare(b.parentTitle))
    .slice(1)
  logFD('removePreviousDatedBookmarks () 00', 'removeFolderList', removeFolderList)

  if (removeFolderList.length == 0) {
    return
  }

  await Promise.all(
    removeFolderList.map(
      ({ id }) => chrome.bookmarks.remove(id)
    )
  )
}
