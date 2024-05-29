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
  const [_currentVisit, previousVisit1, previousVisit2, previousVisit3] = filteredList;

  return [previousVisit3, previousVisit2, previousVisit1].map((i) => i?.visitTime).filter(Boolean)
}

export async function getPreviousVisitListWhen(url) {
  const showPreviousVisit = memo.settings[USER_SETTINGS_OPTIONS.SHOW_PREVIOUS_VISIT]

  if (showPreviousVisit === SHOW_PREVIOUS_VISIT_OPTION.ALWAYS || showPreviousVisit === SHOW_PREVIOUS_VISIT_OPTION.ONLY_NO_BKM) {
    return getPreviousVisitList(url)
  }

  return []
}