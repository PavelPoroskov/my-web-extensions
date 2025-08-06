const ALLOWED_DISTANCE = 3

function getIsConditionFromUp(letterList, iTest) {
  let distanceFromUp = 0
  let i = iTest - 1

  while (-1 < i) {
    distanceFromUp += letterList[i].n

    if (ALLOWED_DISTANCE <= distanceFromUp) {
      return true
    }

    if (letterList[i].isHighlight) {
      return false
    }

    i = i - 1
  }

  return i == -1
}

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
      const isConditionFromDown = getIsConditionFromDown(letterList, i)

      if (isConditionFromDown) {
        letterList[i].isHighlight = true
        distanceFromUp = 0
      }
    }

    i = i + 1
  }
}

function getHighlightSet(letterList = []) {
  if (letterList.length == 0) {
    return new Set()
  }

  letterList.forEach(({ n }, index, arr) => {
    if (ALLOWED_DISTANCE <= n) {
      arr[index].isHighlight = true
    }
  })

  const priorityCheckList = letterList
    .map(({ letter, n }, index) => ({ letter, n, index }))
    .filter(({ n }) => 1 < n && n < ALLOWED_DISTANCE)
    .toSorted((a, b) => -(a.n - b.n) || a.index - b.index)

  priorityCheckList.forEach(({ index }) => {
    const isConditionFromUp = getIsConditionFromUp(letterList, index)

    if (isConditionFromUp) {
      const isConditionFromDown = getIsConditionFromDown(letterList, index)

      if (isConditionFromDown) {
        letterList[index].isHighlight = true
      }
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
  const letterToNMap = {}

  resultList.forEach(({ letter }) => {
    letterToNMap[letter] = (letterToNMap[letter] || 0) + 1
  })

  const letterList = Object.entries(letterToNMap)
    .map(([letter, n]) => ({ letter, n }))
    .toSorted((a, b) => a.letter.localeCompare(b.letter))

  return letterList
}

export function getFirstLetter(title) {
  return new Intl.Segmenter().segment(title).containing(0).segment.toUpperCase()
}

export function highlightAlphabet({
  list = [],
  fnGetFirstLetter = ({ title }) => getFirstLetter(title),
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
