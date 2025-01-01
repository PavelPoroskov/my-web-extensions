import {
  IS_BROWSER_FIREFOX,
} from '../constant/index.js';
import {
  browserStartTime,
} from '../data-structures/index.js';
import {
  startPartialUrlSearch,
} from './url-search.api.js'
import {
  makeLogFunction,
} from './log.api.js'

const logHA = makeLogFunction({ module: 'history.api' })

const dayMS = 86400000;
const hourMS = 3600000;
const minMS = 60000;

function formatPrevVisit (inMS) {

  const dif = Date.now() - inMS;

  let result = ''
  const days = Math.floor(dif / dayMS)

  if (days > 0) {
    result = `D ${days}`
  } else {
    const hours = Math.floor(dif / hourMS)

    if (hours > 0) {
      result = `h ${hours}`
    } else {
      const mins = Math.floor(dif / minMS)

      if (mins > 0) {
        result = `m ${mins}`
      } else {
        result = 'm 0'
      }
    }
  }

  return result
}

function filterTimeList(timeList) {
  const representationSet = new Set()
  const resultNewToOld = []

  for (const visitTime of timeList) {
    const visitRepresentation = formatPrevVisit(visitTime)

    if (!(representationSet.has(visitRepresentation))) {
      representationSet.add(visitRepresentation)
      resultNewToOld.push(visitTime)

      if (representationSet.size >= 3) {
        break
      }
    }
  }

  return resultNewToOld
}

async function getVisitListForUrl(url) {
  const visitList = (await chrome.history.getVisits({ url }))
    .filter((i) => i.visitTime)

  let newToOldList
  let previousList

  // browser has opened tab with url1, close browser, open browser
  //  chrome create visit with transition 'reopen'
  //  firefox does't create visit
  //    how differ in firefox?
  //      just manually opened tab with url2
  //      tab from previous session with url1
  //    visit.visitTime > browserProfileStartTime
  if (IS_BROWSER_FIREFOX) {
    newToOldList = visitList

    const mostNewVisitMS = newToOldList[0]?.visitTime
    const startTime = await browserStartTime.get()

    if (mostNewVisitMS && mostNewVisitMS > startTime) {
      previousList = newToOldList.slice(1)
    } else {
      previousList = newToOldList
    }
  } else {
    newToOldList = visitList.toReversed()
    previousList = newToOldList.slice(1)
  }

  const filteredList = previousList.filter(({ transition }) => transition !== 'reload')
  const filteredTimeList = filteredList
    .map((i) => i.visitTime)

  return filteredTimeList
}

async function getVisitListForUrlList(urlList) {
  const allVisitList = await Promise.all(urlList.map(
    url => getVisitListForUrl(url)
  ))

  return allVisitList
    .flat()
    .sort((a,b) => -(a - b))
}

async function getPreviousVisitList(url) {
  const {
    isSearchAvailable,
    urlForSearch,
    isUrlMatchToPartialUrlSearch,
  } = await startPartialUrlSearch(url)

  let historyItemList

  if (isSearchAvailable) {
    historyItemList = (await chrome.history.search({
      text: urlForSearch,
      maxResults: 10,
    }))
      .filter(
        (i) => i.url && isUrlMatchToPartialUrlSearch(i.url)
      )
  } else {
    historyItemList = (await chrome.history.search({
      text: url,
      maxResults: 10,
    }))
      .filter((i) => i.url && i.url.startsWith(url))
  }

  return getVisitListForUrlList(historyItemList.map(i => i.url))
}

export async function getHistoryInfo({ url }) {
  logHA('getHistoryInfo () 00', url)
  const allVisitList = await getPreviousVisitList(url);
  logHA('getHistoryInfo () 11 allVisitList', allVisitList)
  const groupedList = allVisitList.flatMap((value, index, array) => index === 0 || array[index - 1] - value  > 60000 ? [value]: [])
  logHA('getHistoryInfo () 22 groupedList', groupedList)
  const filteredList = filterTimeList(groupedList)
  logHA('getHistoryInfo () 33 filteredList', filteredList)

  const visitString = filteredList
    .toReversed()
    .map((i) => formatPrevVisit(i))
    .flatMap((value, index, array) => index === 0 || value !== array[index - 1] ? [value]: [])
    .join(", ")

  logHA('getHistoryInfo () 44 visitString', visitString)

  return {
    visitString
  };
}
