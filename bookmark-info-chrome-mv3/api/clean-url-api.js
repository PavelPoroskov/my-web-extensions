
import { clearUrlTargetList } from '../constant/index.js'


const targetMap = new Map(
  clearUrlTargetList.map(({ hostname, paths }) => [hostname, paths])
)

const getHostBase = (str) => str.split('.').slice(-2).join('.')


export const removeQueryParamsIfTarget = (url) => {
  let cleanUrl = url
  let isPattern = false

  try {
    const oLink = new URL(url);
    const { hostname, pathname } = oLink;
    const targetPathList = targetMap.get(getHostBase(hostname))

    if (targetPathList && targetPathList.some((targetPath) => pathname.startsWith(targetPath))) {
      isPattern = true
      oLink.search = ''

      cleanUrl = oLink.toString();  
    }
  
  /* eslint-disable no-unused-vars */
  // eslint-disable-next-line no-empty
  } catch (_e) {
    
  }
  /* eslint-enable no-unused-vars */

  return {
    cleanUrl,
    isPattern,
  }
}

export const removeQueryParams = (link) => {
  try {
    const oLink = new URL(link);
    oLink.search = ''
  
    return oLink.toString();  
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