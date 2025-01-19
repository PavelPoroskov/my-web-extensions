export const DEFAULT_HOST_SETTINGS = {
  isHashRequired: false,
  searchParamList: [
    '*id',
    ['utm_*'],
    ['email_hash'],
    ['sent_date'],
  ],
}

const urlSettingsGo = {
  'mail.google.com': {
    isHashRequired: true,
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

const urlSettingsUse = {
  'frontendmasters.com': {
    removeAllSearchParamForPath: [
      '/courses/:id/',
    ]
  },
  'github.com': {
    searchParamList: [
      ['tab'],
    ],
  },
  'imdb.com': {
    searchParamList: [
      ['ref_'],
      'season',
    ],
  },
  'linkedin.com': {
    removeAllSearchParamForPath: [
      '/jobs/view/:id/',
      '/posts/:id/',
    ],
    searchParamList: [
      'currentJobId',
    ],
    theSame: [
      '/jobs/view/:currentJobId/',
      '/jobs/*?currentJobId=:currentJobId',
      // '/jobs/collections/recommended/?currentJobId=:currentJobId',
      // '/jobs/search/?currentJobId=:currentJobId',
    ],
  },
  'marketplace.visualstudio.com': {
    searchParamList: [
      'itemName',
    ],
  },
  'udemy.com': {
    removeAllSearchParamForPath: [
      '/course/:id/',
    ],
  },
}

const urlSettingsEnt = {
  '9gag.com': {
    isHashRequired: true,
  },
}

const urlSettingsDark = {
  'forcoder.net': {
    searchParamList: [
      's',
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
}

const urlSettingsRu = {
  'avito.ru': {
    searchParamList: [
      ['utm_*'],
    ],
  },
  'hh.ru': {
    removeAllSearchParamForPath: [
      '/employer/:id',
      '/resume/:id',
      '/vacancy/:id',
    ],
    searchParamList: [
      ['hhtmFrom'],
      ['hhtmFromLabel'],
      'text',
      'professional_role',
      'resume',
    ],
    theSame: [
      '/vacancy/:vacancyId',
      '?vacancyId=:vacancyId',
    ],
    getAuthor: {
      pagePattern: '/vacancy/:id',
      authorSelector: '.vacancy-company-name a[href^="/employer/"]',
    }
  },
  'opennet.ru': {
    searchParamList: [
      'num',
    ],
  },

}

export const HOST_URL_SETTINGS = Object.assign(
  {},
  urlSettingsGo,
  urlSettingsUse,
  urlSettingsEnt,
  urlSettingsDark,
  urlSettingsRu,
)
export const HOST_URL_SETTINGS_SHORT = Object.assign(
  {},
  urlSettingsGo,
  urlSettingsUse,
  urlSettingsEnt,
)
