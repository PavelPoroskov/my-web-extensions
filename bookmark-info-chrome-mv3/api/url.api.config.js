import {
  makeLogFunction,
} from './log.api.js'
import {
  isNotEmptyArray,
} from './common.api.js'

const logUAC = makeLogFunction({ module: 'url.api.config' })

const HOST_URL_SETTINGS = [
  // TODO-NEXT if we clean url on open then we loose check-in, check-out dates
  //    need search bookmark for clean url
  //    strategy01: clean url on open
  //    strategy02: clean url on save
  //    strategy00: don't clear url, default
  // {
  //   hostname: 'airbnb.com',
  //   paths: [
  //     '/rooms/',
  //   ]
  // },
  // {
  //   hostname: 'djinni.co',
  //   removeAllSearchParamForPath: [
  //     '/my/profile/',
  //     '/jobs/',
  //   ]
  // },
  {
    hostname: 'forcoder.net',
    searchParamList: [
      's', // https://forcoder.net/?s=CQRS
    ],
  },
  {
    hostname: 'frontendmasters.com',
    removeAllSearchParamForPath: [
      '/courses/:id/',
    ]
  },
  {
    hostname: 'hh.ru',
    removeAllSearchParamForPath: [
      '/vacancy/:id',
    ],
    searchParamList: [
      ['hhtmFrom'],
      ['hhtmFromLabel'],
      'text',
      'professional_role',
    ],
  },
  {
    hostname: 'imdb.com',
    // removeAllSearchParamForPath: [
    //   '/title/',
    //   '/list/',
    //   '/imdbpicks/',
    //   '/interest/',
    //   '/',
    // ],
    //
    searchParamList: [
      ['ref_'],
      'season', // https://www.imdb.com/title/tt8111088/episodes/?season=3&ref_=tt_eps_sn_3
    ],
  },
  // TODO the same
  // https://www.linkedin.com/jobs/collections/recommended/?currentJobId=4096094176
  // https://www.linkedin.com/jobs/view/4096094176/?alternateChannel=search&refId=WYo23okoaVDvmJkLoaclcg%3D%3D&trackingId=bTIytUCJN%2BDpKjaalPv4gg%3D%3D
  // https://www.linkedin.com/jobs/search/?currentJobId=4096094176&geoId=106686604&origin=JOBS_HOME_LOCATION_AUTOCOMPLETE&refresh=true
  {
    hostname: 'linkedin.com',
    removeAllSearchParamForPath: [
      '/jobs/view/:id/',
      '/posts/:id/'
    ]
  },
  {
    hostname: 'opennet.ru',
    searchParamList: [
      'num',
    ],
  },
  {
    hostname: 'thepiratebay.org',
    searchParamList: [
      'q',
    ],
  },
  {
    hostname: 'torrentgalaxy.to',
    searchParamList: [
      'cat',
    ],
  },
  {
    hostname: 'udemy.com',
    removeAllSearchParamForPath: [
      '/course/:id/',
    ]
  },
  {
    hostname: 'www.google.com',
    searchParamList: [
      'q', // https://www.google.com/search?q=react-native
    ],
  },
  {
    hostname: 'mail.google.com',
    isHashRequired: true,
  },
  {
    hostname: 'youtube.com',
    hostnameAliasList: ['youtu.be'],
    searchParamList: [
      'v', // https://www.youtube.com/watch?v=qqqqq
    ],
  },
]

// all articles of author
// https://dev.to/codewithsadee
//  https://dev.to/:author
//
// article
// https://dev.to/codewithsadee/build-deploy-a-stunning-saas-landing-page-with-react-tailwind-51p0
//  https://dev.to/:author/:slug
//
// https://www.youtube.com/watch?v=qqqqq
//  // https://www.youtube.com/watch?v=:slug

// logUAC('HOST_URL_SETTINGS', HOST_URL_SETTINGS.length, HOST_URL_SETTINGS)
const HOST_URL_SETTINGS_LIST = HOST_URL_SETTINGS.map((item) => {
  const searchParamList = item.searchParamList || []
  const importantSearchParamList = searchParamList
    .filter((searchParmName) => typeof searchParmName == 'string')
    .filter(Boolean)

  const removeSearchParamList = searchParamList
    .filter((searchParm) => isNotEmptyArray(searchParm))
    .map((searchParm) => searchParm[0])
    .filter(Boolean)

  return {
    ...item,
    removeSearchParamList,
    importantSearchParamList,
  }
})

// logUAC('HOST_URL_SETTINGS_LIST', HOST_URL_SETTINGS_LIST.length, HOST_URL_SETTINGS_LIST)
const HOST_URL_SETTINGS_MAP = new Map(
  HOST_URL_SETTINGS_LIST.map((item) => [item.hostname, item]),
)

export const getHostSettings = (url) => {
  logUAC('getHostSettings 00', url)
  const oUrl = new URL(url);
  const { hostname } = oUrl;
  logUAC('getHostSettings 11', hostname)
  // logUAC('HOST_URL_SETTINGS_MAP', HOST_URL_SETTINGS_MAP)

  let targetHostSettings = HOST_URL_SETTINGS_MAP.get(hostname)
  logUAC('targetHostSettings 22 hostname', targetHostSettings)

  if (!targetHostSettings) {
    const [firstPart, ...restPart] = hostname.split('.')
    logUAC('targetHostSettings 33', firstPart, restPart.join('.'))

    if (firstPart == 'www') {
      targetHostSettings = HOST_URL_SETTINGS_MAP.get(restPart.join('.'))
      logUAC('targetHostSettings 44', targetHostSettings)
    } else {
      targetHostSettings = HOST_URL_SETTINGS_MAP.get(`www.${hostname}`)
      logUAC('targetHostSettings 55', targetHostSettings)
    }
  }

  if (!targetHostSettings) {
    const baseDomain = hostname.split('.').slice(-2).join('.')

    targetHostSettings = HOST_URL_SETTINGS_MAP.get(baseDomain)
    logUAC('targetHostSettings 66 baseDomain', baseDomain, targetHostSettings)
  }

  return targetHostSettings
}

export const HOST_LIST_FOR_PAGE_OPTIONS = HOST_URL_SETTINGS_LIST
  .toSorted()
  .filter(({ removeSearchParamList, removeAllSearchParamForPath }) => isNotEmptyArray(removeSearchParamList) || isNotEmptyArray(removeAllSearchParamForPath))
  .map(
    ({ hostname, removeAllSearchParamForPath }) => `${hostname}{${(removeAllSearchParamForPath || []).toSorted().join(',')}}`
  )
