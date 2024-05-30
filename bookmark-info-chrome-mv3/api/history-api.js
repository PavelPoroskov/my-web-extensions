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
  const visitList = await chrome.history.getVisits({ url });
  
  const orderedList = IS_BROWSER_FIREFOX ? visitList : visitList.toReversed();
  // const filteredList = [].concat(
  //   orderedList.slice(0,1),
  //   orderedList.slice(1).filter(({ transition }) => transition !== 'reload')
  // )
  // const [currentVisit, previousVisit1, previousVisit2, previousVisit3] = filteredList;
  //const result = [previousVisit3, previousVisit2, previousVisit1].map((i) => i?.visitTime).filter(Boolean)
  
  const filteredList = orderedList.slice(1)
    .filter(({ transition }) => transition !== 'reload')
  const filteredTimeList = filteredList
    .map((i) => i?.visitTime)
    .filter(Boolean)

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

  // browser has opened tab with url1, close browser, open browser
  //  chrome create visit with transition 'reopen'
  //  firefox does't create visit
  //    how differ in firefox?
  //      just manually opened tab with url2
  //      tab from previous session with url1
  //    TRY
  //      see fields for visits for both this situation
  //        ? by field visitId, id(historyId)
  //        keep maxVisitId in storage?
  // const filteredList = orderedList.filter(({ transition }) => transition !== 'reload')
  // const [currentVisit, previousVisit1, previousVisit2, previousVisit3] = filteredList;
  // const result = [previousVisit3, previousVisit2, previousVisit1 || currentVisit].map((i) => i?.visitTime).filter(Boolean)

  logDebug('getPreviousVisitList', url)
  logDebug('orderedList', orderedList)
  logDebug('filteredList', filteredList)
  logDebug('resultNewToOld', resultNewToOld)

  return resultNewToOld
}

async function getPreviousVisitListWhen(url) {
  const showPreviousVisit = memo.settings[USER_SETTINGS_OPTIONS.SHOW_PREVIOUS_VISIT]

  if (showPreviousVisit === SHOW_PREVIOUS_VISIT_OPTION.ALWAYS || showPreviousVisit === SHOW_PREVIOUS_VISIT_OPTION.ONLY_NO_BKM) {
    return getPreviousVisitList(url)
  }

  return []
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
    previousVisitList = await getPreviousVisitListWhen(url);
    memo.cacheUrlToVisitList.add(url, previousVisitList);
  }

  return previousVisitList;
}
