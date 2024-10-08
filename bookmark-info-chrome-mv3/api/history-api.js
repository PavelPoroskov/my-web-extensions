import {
  IS_BROWSER_FIREFOX,
  STORAGE_KEY,
} from '../constant/index.js';
import {
  removeQueryParamsIfTarget,
} from './clean-url-api.js';
import {
  browserStartTime,
  extensionSettings,
} from './structure/index.js';

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
  const settings = await extensionSettings.get()
  let rootUrl

  if (settings[STORAGE_KEY.CLEAR_URL]) {
    const { cleanUrl, isPattern } = removeQueryParamsIfTarget(url)

    if (isPattern) {
      rootUrl = cleanUrl
    }
  } 

  if (rootUrl) {
    const historyItemList = (await chrome.history.search({
      text: rootUrl,
      maxResults: 10,
    }))
      .filter((i) => i.url && i.url.startsWith(rootUrl))

    return getVisitListForUrlList(historyItemList.map(i => i.url))
  } else {
    return getVisitListForUrl(url)
  }
}

// eslint-disable-next-line no-unused-vars
export async function getHistoryInfo({ url, useCache=false }) {
  let visitList;
  // let source;

  // if (useCache) {
  //   visitList = memo.cacheUrlToVisitList.get(url);
    
  //   if (visitList) {
  //     source = SOURCE.CACHE;
  //     logOptimization(' getHistoryInfoUni: from cache bookmarkInfo')
  //   }
  // } 
  
  // if (!visitList) {
    const allVisitList = await getPreviousVisitList(url);
    visitList = filterTimeList(allVisitList)
    // source = SOURCE.ACTUAL;
    // memo.cacheUrlToVisitList.add(url, visitList);
  // }

  return {
    visitList,
    // source,
  };
}
