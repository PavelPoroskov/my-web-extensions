import {
  makeLogFunction,
} from '../api/log.api.js'
import {
  ExtraMap,
} from './extraMap.js'

const logTH = makeLogFunction({ module: 'tagList-highlight.js' })

const ALLOWED_DISTANCE = 4

function getIsConditionFromDown(letterList, iTest) {
  let distanceFromDown = 0
  let i = iTest + 1

  while (i < letterList.length) {
    distanceFromDown += letterList[i - 1].n

    if (ALLOWED_DISTANCE <= distanceFromDown) {
      return true
    }

    if (letterList[i].isHighlight) {
      return false
    }

    // epic error
    // i =+ 1
    i = i + 1
  }

  return i == letterList.length
}

function markItemInList(letterList) {
  logTH('markItemInList () 00')
  let distanceFromUp = 0
  let i = 0

  while (i < letterList.length) {
    distanceFromUp = distanceFromUp + (i == 0
      ? ALLOWED_DISTANCE
      : letterList[i - 1].n
    )

    if (letterList[i].isHighlight) {
      distanceFromUp = 0
    } else if (ALLOWED_DISTANCE <= distanceFromUp) {
      logTH('markItemInList () 11 ALLOWED_DISTANCE <= distanceFromUp', letterList[i].letter)
      const isConditionFromDown = getIsConditionFromDown(letterList, i)
      logTH('markItemInList () 11 isConditionFromDown', letterList[i].letter, isConditionFromDown)

      if (isConditionFromDown) {
        letterList[i].isHighlight = true
        distanceFromUp = 0
        logTH('markItemInList () 11 add', letterList[i].letter)
      }
    }

    i = i + 1
  }
}

function getHighlightSet(letterList = []) {
  logTH('getHighlightSet () 00', letterList)
  if (letterList.length == 0) {
    return new Set()
  }

  letterList.forEach(({ letter, n }, index, arr) => {
    if (ALLOWED_DISTANCE <= n) {
      logTH('getHighlightSet () 11 ALLOW_DISTANCE <= n', letter, n)
      arr[index].isHighlight = true
    }
  })

  markItemInList(letterList)

  return new Set(
    letterList
      .filter(({ isHighlight }) => isHighlight)
      .map(({ letter }) => letter)
  )
}

function getGroupedLetterList(resultList) {
  const letterToNMap = new ExtraMap()

  resultList.forEach(({ letter }) => {
    letterToNMap.sum(letter, 1)
  })

  const letterList = Array.from(letterToNMap.entries())
    .map(([letter, n]) => ({ letter, n }))
    .toSorted((a, b) => a.letter.localeCompare(b.letter))

  return letterList
}

export function highlightAlphabet({
  list = [],
  fnGetFirstLetter = (i) => i.title.at(0).toUpperCase(),
}) {
  const midList = list.map((item) => ({
    ...item,
    letter: fnGetFirstLetter(item),
  }))

  const highlightSet = getHighlightSet(
    getGroupedLetterList(midList)
  )
  const resultList = []

  midList.forEach(({ letter, ...rest }) => {
    if (highlightSet.has(letter)) {
      resultList.push({
        ...rest,
        isHighlight: 1,
      })
      highlightSet.delete(letter)
    } else {
      resultList.push(rest)
    }
  })

  return resultList
}
