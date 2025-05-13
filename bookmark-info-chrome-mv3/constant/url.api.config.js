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
    removeAllSearchParamForPath: [
      '/:@channel',
      '/:@channel/videos',
      '/c/:channel',
      '/c/:channel/videos',
    ],
    searchParamList: [
      'v',
      // ['list'],
      ['index'],
      ['start_radio'],
      ['rv'],
    ],
    getAuthor: {
      pagePattern: '/watch?v=:id',
      authorSelector: '.ytd-channel-name a[href]',
      authorPattern: '/:@channel'
    }
  },
}

const urlSettingsUse = {
  'dev.to': {
    getAuthor: {
      pagePattern: '/:author/:post',
      authorSelector: '.crayons-article__header__meta a.crayons-link[href]',
    }
  },
  'frontendmasters.com': {
    removeAllSearchParamForPath: [
      '/courses/:id/',
    ]
  },
  'freecodecamp.org': {
    getAuthor: {
      pagePattern: '/news/:id',
      authorSelector: '.author-card-name a[href^="/news/author/"]',
    }
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
    getAuthor: [
      {
        pagePattern: '/jobs/view/:id',
        authorSelector: '.job-details-jobs-unified-top-card__company-name a[href^="https://www.linkedin.com/company/"]',
        authorPattern: '/company/:company'
      },
      {
        pagePattern: '/jobs/collections/recommended/?currentJobId=:currentJobId',
        authorSelector: '.job-details-jobs-unified-top-card__company-name a[href^="https://www.linkedin.com/company/"]',
        authorPattern: '/company/:company'
      },
      {
        pagePattern: '/jobs/search/?currentJobId=:currentJobId',
        authorSelector: '.job-details-jobs-unified-top-card__company-name a[href^="https://www.linkedin.com/company/"]',
        authorPattern: '/company/:company'
      },
    ]
  },
  'blog.logrocket.com': {
    getAuthor: {
      pagePattern: '/:post/',
      authorSelector: 'a#post-author-name[href]',
    }
  },
  'marketplace.visualstudio.com': {
    searchParamList: [
      'itemName',
    ],
  },
  'stackoverflow.com': {
    removeAllSearchParamForPath: [
      '/questions/:questionNumber/:question',
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
    getAuthor: {
      pagePattern: '/:location/vakansii/:id',
      authorSelector: '.js-seller-info-name a[href]',
    }
  },
  'career.habr.com': {
    getAuthor: {
      pagePattern: '/vacancies/:id',
      authorSelector: '.company_name a[href^="/companies/"]',
    }
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
  'rabota.ru': {
    searchParamList: [
      ['recommendationId'],
      ['methodRecommendationId'],
      ['methodRecommendationType'],
      ['methodRecommendationName'],
    ],
  },
  'web.telegram.org': {
    isHashRequired: true,
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
