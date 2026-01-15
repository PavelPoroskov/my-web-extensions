import {
  singular,
} from '../api-low/index.js';
import {
  getDatedTemplate,
  getTitleWithDirectives,
  isChangesInDirectives,
  isDatedFolderTitle,
} from './folder-title-dated.js';
import {
  getTitleDetails,
} from './folder-title-directives.js';

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

export const getTitleForPattern = (title) => {
  let result

  if (isDatedFolderTitle(title)) {
    const datedTemplate = getDatedTemplate(title)
    result = getTitleDetails(datedTemplate).onlyTitle
  } else {
    result = getTitleDetails(title).onlyTitle
  }

  return result
}

export async function mergeFolderTitle({ oldTitle, newTitle }) {
  const {
    onlyTitle: oldOnlyTitle,
    objDirectives: objOldDirectives,
  } = getTitleDetails(oldTitle)

  const {
    onlyTitle: newOnlyTitle,
    objDirectives: objNewDirectives,
  } = getTitleDetails(newTitle)

  const oldBigLetterN = oldOnlyTitle.replace(/[^A-Z]+/g, "").length
  const newBigLetterN = newOnlyTitle.replace(/[^A-Z]+/g, "").length

  const oldDashN = oldOnlyTitle.replace(/[^-]+/g,"").length
  const newDashN = newOnlyTitle.replace(/[^-]+/g,"").length

  const isUseNewTitle = oldBigLetterN < newBigLetterN || newDashN < oldDashN
  const actualOnlyTitle = isUseNewTitle ? newOnlyTitle : oldOnlyTitle

  const hasChangesInDirectives = isChangesInDirectives({ oldDirectives: objOldDirectives, newDirectives: objNewDirectives })

  if (hasChangesInDirectives || isUseNewTitle) {
    const objSumDirectives = Object.assign({}, objOldDirectives, objNewDirectives)
    const mergedTitle = getTitleWithDirectives({ onlyTitle: actualOnlyTitle, objDirectives: objSumDirectives })

    return mergedTitle
  }
}
