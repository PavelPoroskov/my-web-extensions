import {
  logDebug,
  logOptimization,
} from './debug.js'
import {
  USER_SETTINGS_OPTIONS,
  SHOW_PREVIOUS_VISIT_OPTION,
  IS_BROWSER_FIREFOX,
} from '../constants.js'
import {
  memo,
} from './memo.js'

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

export async function getPreviousVisitList(url) {
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

    if (mostNewVisitMS && mostNewVisitMS > memo.profileStartMS) {
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

  const representationSet = new Set()
  const resultNewToOld = []

  for (const visitTime of filteredTimeList) {
    const visitRepresentation = formatPrevVisit(visitTime)

    if (!(representationSet.has(visitRepresentation))) {
      representationSet.add(visitRepresentation)
      resultNewToOld.push(visitTime)

      if (representationSet.size >= 3) {
        break
      }
    }
  }

  logDebug('getPreviousVisitList', url)
  logDebug('newToOldList', newToOldList)
  logDebug('filteredList', filteredList)
  logDebug('resultNewToOld', resultNewToOld)

  return resultNewToOld
}

export async function getHistoryInfo({ url, useCache=false }) {
  const showPreviousVisit = memo.settings[USER_SETTINGS_OPTIONS.SHOW_PREVIOUS_VISIT]
  
  if (!(showPreviousVisit === SHOW_PREVIOUS_VISIT_OPTION.ALWAYS || showPreviousVisit === SHOW_PREVIOUS_VISIT_OPTION.ONLY_NO_BKM)) {
    return []
  }

  let previousVisitList;

  if (useCache) {
    previousVisitList = memo.cacheUrlToVisitList.get(url);
    
    if (previousVisitList) {
      logOptimization(' getHistoryInfoUni: from cache bookmarkInfo')
    }
  } 
  
  if (!previousVisitList) {
    previousVisitList = await getPreviousVisitList(url);
    memo.cacheUrlToVisitList.add(url, previousVisitList);
  }

  return previousVisitList;
}
