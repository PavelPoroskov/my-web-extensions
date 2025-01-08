export const DEFAULT_HOST_SETTINGS = {
  isHashRequired: false,
  searchParamList: [
    '*id',
    ['utm_*'],
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
