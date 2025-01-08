export const HOST_URL_SETTINGS = {
  '9gag.com': {
    isHashRequired: true,
  },
  'avito.ru': {
    removeAllSearchParamForPath: [
      '/',
    ]
  },
  'forcoder.net': {
    searchParamList: [
      's', // https://forcoder.net/?s=CQRS
    ],
  },
  'frontendmasters.com': {
    removeAllSearchParamForPath: [
      '/courses/:id/',
    ]
  },
  'hh.ru': {
    removeAllSearchParamForPath: [
      '/vacancy/:id',
      '/resume/:id',
    ],
    searchParamList: [
      ['hhtmFrom'],
      ['hhtmFromLabel'],
      'text',
      'professional_role',
      'resume',
    ],
  },
  'imdb.com': {
    searchParamList: [
      ['ref_'],
      'season', // https://www.imdb.com/title/tt8111088/episodes/?season=3&ref_=tt_eps_sn_3
    ],
  },
  'linkedin.com': {
    removeAllSearchParamForPath: [
      '/jobs/view/:id/',
      '/posts/:id/',
    ],
  },
  'mail.google.com': {
    isHashRequired: true,
  },
  'marketplace.visualstudio.com': {
    searchParamList: [
      'itemName',
    ],
  },
  'opennet.ru': {
    searchParamList: [
      'num',
    ],
  },
  'thepiratebay.org': {
    searchParamList: [
      'q',
      'id',
    ],
  },
  'torrentgalaxy.to': {
    searchParamList: [
      'cat',
    ],
  },
  'udemy.com': {
    removeAllSearchParamForPath: [
      '/course/:id/',
    ],
  },
  'www.google.com': {
    searchParamList: [
      'q',
    ],
  },
  'youtu.be': 'youtube.com',
  'youtube.com': {
    searchParamList: [
      'v',
    ],
  },
}
