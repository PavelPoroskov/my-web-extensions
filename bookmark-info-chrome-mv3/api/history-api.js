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

export async function getPreviousVisitList(url) {
  const visitList = await chrome.history.getVisits({ url });
  
  const orderedList = IS_BROWSER_FIREFOX ? visitList : visitList.toReversed();
  const filteredList = [].concat(
    orderedList.slice(0,1),
    orderedList.slice(1).filter(({ transition }) => transition !== 'reload')
  )
  const [currentVisit, previousVisit1, previousVisit2, previousVisit3] = filteredList;
  const result = [previousVisit3, previousVisit2, previousVisit1].map((i) => i?.visitTime).filter(Boolean)

  // const filteredList = orderedList.filter(({ transition }) => transition !== 'reload')
  // const [currentVisit, previousVisit1, previousVisit2, previousVisit3] = filteredList;
  // const result = [previousVisit3, previousVisit2, previousVisit1 || currentVisit].map((i) => i?.visitTime).filter(Boolean)

  logDebug('getPreviousVisitList', url)
  logDebug('orderedList', orderedList)
  logDebug('filteredList', filteredList)
  logDebug('result', result)

  return result
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
