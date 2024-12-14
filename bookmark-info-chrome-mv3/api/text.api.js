import {
    singular,
} from './pluralize.js';

export const trimTitle = (title) => title
    .trim()
    .replace(/\s+/, ' ')

export const normalizeTitle = (title) => {  
    const trimmedTitle = title
        .trim()
        .replaceAll('-', ' ')
        .replace(/\s+/, ' ')
        .toLowerCase()

    const wordList = trimmedTitle.split(' ')
    const lastWord = wordList.at(-1)
    const singularLastWord = singular(lastWord)
    const normalizedWordList = wordList.with(-1, singularLastWord)
    const normalizedTitle = normalizedWordList.join(' ')

    return normalizedTitle
}

export function isStartWithTODO(str) {
    return !!str && str.slice(0, 4).toLowerCase() === 'todo'
}

