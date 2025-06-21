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

export function getTitleDetails(title) {
  const parts = title
    .split(' ')
    .filter(Boolean)

  const objDirectives = {}

  while (0 < parts.length) {
    const lastWord = parts.at(-1)

    if (lastWord.startsWith('#') || lastWord.startsWith(':')) {
      let key = lastWord.toLowerCase()
      let value = ''

      if (key.startsWith('#') && key != '#top') {
        key = '#color'
        value = key.slice(1).toUpperCase()
      }

      objDirectives[key] = value;
      parts.pop()
    } else {
      break
    }
  }

  const cleanTitle = parts.join(' ')

  return {
    cleanTitle,
    objDirectives,
  }
}

export function getTitleWithDirectives({ title, objDirectives }) {
  const strDirectives = Object.entries(objDirectives)
    .toSorted((a,b) => a[0].localeCompare(b[0]))
    .map(([key,value]) => (key == '#color'
      ? `#${value}`
      : key
    ))
    .join(' ')

    return [title, strDirectives].filter(Boolean).join(' ')
}

export function isChangesInDirectives(objOldDirectives, objNewDirectives) {
  // if (Object.keys(objNewDirectives).length == 0) {
  //   return false
  // }

  for (const key in objNewDirectives) {
    if (!(key in objOldDirectives)) {
      return true
    }

    if (objOldDirectives[key] != objNewDirectives[key]) {
      return true
    }
  }

  return false
}
