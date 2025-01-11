import {
  singular,
} from './pluralize.js';

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
