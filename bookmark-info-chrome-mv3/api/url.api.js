import {
  clearUrlTargetList 
} from './url.api.config.js'
import {
  makeLogFunction,
} from '../api/log.api.js'

const logUA = makeLogFunction({ module: 'url.api' })

const targetHostSettingsMap = new Map(
  clearUrlTargetList.map(({ hostname, paths, removeSearchParamList }) => [
    hostname, 
    { 
      paths, 
      removeSearchParamList: removeSearchParamList || [] 
    }
  ])
)

const getHostBase = (str) => str.split('.').slice(-2).join('.')

export const removeQueryParamsIfTarget = (url) => {
  logUA('removeQueryParamsIfTarget () 00', url)
  let cleanUrl = url
  let isPattern = false

  try {
    const oLink = new URL(url);
    const { hostname, pathname } = oLink;
    const targetHostSettings = targetHostSettingsMap.get(getHostBase(hostname))

    if (targetHostSettings) {
      const { paths: targetPathList, removeSearchParamList } = targetHostSettings

      if (removeSearchParamList.length > 0) {
        // remove query params by list
        const oSearchParams = oLink.searchParams;
        const isHasThisSearchParams = removeSearchParamList.some((searchParam) => oSearchParams.get(searchParam) !== null)

        if (isHasThisSearchParams) {
          removeSearchParamList.forEach((searchParam) => {
            oSearchParams.delete(searchParam)
          })
          isPattern = true
          oLink.search = oSearchParams.size > 0
            ? `?${oSearchParams.toString()}`
            : ''
          cleanUrl = oLink.toString();  
        }
      } else if (targetPathList.some((targetPath) => pathname.startsWith(targetPath))) {
        // remove all query params
        isPattern = true
        oLink.search = ''

        cleanUrl = oLink.toString();  
      }
    }
  
  /* eslint-disable no-unused-vars */
  // eslint-disable-next-line no-empty
  } catch (_e) {
    
  }
  /* eslint-enable no-unused-vars */

  logUA('removeQueryParamsIfTarget () 99 cleanUrl', isPattern, cleanUrl)

  return {
    cleanUrl,
    isPattern,
  }
}

export function removeAnchorAndSearchParams(link) {
  try {
    const oLink = new URL(link);
    oLink.search = ''
    const resNoSearchParams = oLink.toString()
    const [resNoAnchor] = resNoSearchParams.split('#')
  
    return resNoAnchor;  
  // eslint-disable-next-line no-unused-vars
  } catch (e) {
    return link
  }
}

// let testStr = "https://www.linkedin.com/jobs/view/3920634940/?alternateChannel=search&refId=dvaqme%2FfxHehSAa5o4nVnA%3D%3D&trackingId=8%2FZKaGcTAInuTTH4NyKDoA%3D%3D"
// console.log('test ', removeQueryParamsIfTarget(testStr))

// testStr = "https://www.youtube.com/watch?v=YuJ6SasIS_E&t=356s"
// console.log('test ', removeQueryParamsIfTarget(testStr))

// testStr = "https://youtube.com/watch?v=YuJ6SasIS_E&t=356s"
// console.log('test ', removeQueryParamsIfTarget(testStr))

// testStr = "https://youtu.be/watch?v=YuJ6SasIS_E&t=356s"
// console.log('test ', removeQueryParamsIfTarget(testStr))
//
// https://career.proxify.io/apply?uuid=566c933b-432e-64e0-b317-dd4390d6a74e&step=AdditionalInformation