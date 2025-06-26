const BROWSER_OPTIONS = {
  CHROME: 'CHROME',
  FIREFOX: 'FIREFOX',
}

const BROWSER_SPECIFIC_OPTIONS = {
  MENU_CONTEXT: {
    [BROWSER_OPTIONS.CHROME]: ['all'],
    [BROWSER_OPTIONS.FIREFOX]: ['all','tab']
  },
}
// TODO remove duplication BROWSER in browser-specific.js and content-scripts.js
const BROWSER = BROWSER_OPTIONS.FIREFOX;
const IS_BROWSER_CHROME = BROWSER === BROWSER_OPTIONS.CHROME;
const IS_BROWSER_FIREFOX = BROWSER === BROWSER_OPTIONS.FIREFOX;

const BROWSER_SPECIFIC = Object.fromEntries(
  Object.entries(BROWSER_SPECIFIC_OPTIONS)
    .map(([option, obj]) => [option, obj[BROWSER]])
);
const EXTENSION_MSG_ID = {
  // TODO remove duplication in EXTENSION_MSG_ID: message-id.js and content-scripts.js
  DELETE_BOOKMARK: 'DELETE_BOOKMARK',
  ADD_BOOKMARK_FOLDER_BY_ID: 'ADD_BOOKMARK_FOLDER_BY_ID',
  ADD_BOOKMARK_FOLDER_BY_NAME: 'ADD_BOOKMARK_FOLDER_BY_NAME',
  FIX_TAG: 'FIX_TAG',
  UNFIX_TAG: 'UNFIX_TAG',
  PAGE_EVENT: 'PAGE_EVENT',
  TAB_IS_READY: 'TAB_IS_READY',
  SHOW_TAG_LIST: 'SHOW_TAG_LIST',
  // TODO remove duplication in EXTENSION_MSG_ID: message-id.js and options.js
  OPTIONS_ASKS_DATA: 'OPTIONS_ASKS_DATA',
  DATA_FOR_OPTIONS: 'DATA_FOR_OPTIONS',
  OPTIONS_ASKS_FLAT_BOOKMARKS: 'OPTIONS_ASKS_FLAT_BOOKMARKS',
  FLAT_BOOKMARKS_RESULT: 'FLAT_BOOKMARKS_RESULT',
  OPTIONS_ASKS_SAVE: 'OPTIONS_ASKS_SAVE',
  UPDATE_AVAILABLE_ROWS: 'UPDATE_AVAILABLE_ROWS',
  RESULT_AUTHOR: 'RESULT_AUTHOR',
}

// TODO remove duplication in CONTENT_SCRIPT_MSG_ID: message-id.js and content-scripts.js
const CONTENT_SCRIPT_MSG_ID = {
  BOOKMARK_INFO: 'BOOKMARK_INFO',
  HISTORY_INFO: 'HISTORY_INFO',
  TAGS_INFO: 'TAGS_INFO',
  CHANGE_URL: 'CHANGE_URL',
  TOGGLE_YOUTUBE_HEADER: 'TOGGLE_YOUTUBE_HEADER',
  GET_USER_INPUT: 'GET_USER_INPUT',
  GET_SELECTION: 'GET_SELECTION',
  REPLACE_URL: 'REPLACE_URL',
  SEND_ME_AUTHOR: 'SEND_ME_AUTHOR',
}
const BASE_ID = 'BKM_INF';

const CONTEXT_MENU_CMD_ID = {
  CLOSE_DUPLICATE: `${BASE_ID}_CLOSE_DUPLICATE`,
  CLOSE_BOOKMARKED: `${BASE_ID}_CLOSE_BOOKMARKED`,
  CLEAR_URL: `${BASE_ID}_CLEAR_URL`,
  TOGGLE_YOUTUBE_HEADER: `${BASE_ID}_TOGGLE_YOUTUBE_HEADER`,
  ADD_BOOKMARK_FROM_SELECTION_MENU: `${BASE_ID}_ADD_BOOKMARK_FROM_SELECTION_MENU`,
  ADD_BOOKMARK_FROM_INPUT_MENU: `${BASE_ID}_ADD_BOOKMARK_FROM_INPUT_MENU`,
  GET_URL_FROM_URL: `${BASE_ID}_GET_URL_FROM_URL`,
};

const KEYBOARD_CMD_ID = {
  ADD_BOOKMARK_FROM_INPUT_KBD: `ADD_BOOKMARK_FROM_INPUT_KBD`,
  ADD_BOOKMARK_FROM_SELECTION_KBD: `ADD_BOOKMARK_FROM_SELECTION_KBD`,
};
const SOURCE = {
  CACHE: 'CACHE',
  ACTUAL: 'ACTUAL',
};
const STORAGE_TYPE = {
  LOCAL: 'LOCAL',
  SESSION: 'SESSION',
}

const TAG_LIST_OPEN_MODE_OPTIONS = {
  GLOBAL: 'GLOBAL',
  PER_PAGE: 'PER_PAGE',
  CLOSE_AFTER_ADD: 'CLOSE_AFTER_ADD',
}
const TAG_LIST_PINNED_TAGS_POSITION_OPTIONS = {
  TOP: 'TOP',
  WITH_RECENT: 'WITH_RECENT',
}
const SHOW_VISITED_OPTIONS = {
  ALWAYS: 'ALWAYS',
  IF_NO_OTHER: 'IF_NO_OTHER',
}

const USER_OPTION_META = {
  CLEAR_URL_ON_PAGE_OPEN: {
    default: true
  },
  DELETE_BOOKMARK_ON_CREATING: {
    default: false,
  },
  DELETE_BOOKMARK_ON_CREATING_LIST: {
    default: [
      'DONE -> TODO',
      'DONE @D -> TODO',
      'DONE DW -> todo dw*',
      'DONE DW -> start dw',
    ],
  },
  DELETE_BOOKMARK_ON_VISITING: {
    default: false,
  },
  DELETE_BOOKMARK_ON_VISITING_LIST: {
    default: [
      'todo continue*',
    ],
  },
  FONT_SIZE: {
    default: 14,
  },
  HIDE_TAG_HEADER_ON_PRINTING: {
    default: false
  },
  MARK_CLOSED_PAGE_AS_VISITED: {
    default: false
  },
  SHOW_VISITED: {
    default: SHOW_VISITED_OPTIONS.IF_NO_OTHER
  },
  SHOW_BOOKMARK_TITLE: {
    default: false
  },
  SHOW_PREVIOUS_VISIT: {
    default: false
  },
  TAG_LIST_HIGHLIGHT_LAST: {
    default: 7
  },
  TAG_LIST_HIGHLIGHT_ALPHABET: {
    default: true,
  },
  TAG_LIST_OPEN_MODE: {
    default: TAG_LIST_OPEN_MODE_OPTIONS.PER_PAGE,
  },
  TAG_LIST_PINNED_TAGS_POSITION: {
    default: TAG_LIST_PINNED_TAGS_POSITION_OPTIONS.TOP,
  },
  TAG_LIST_TAG_LENGTH: {
    default: 15
  },
  USE_FLAT_FOLDER_STRUCTURE: {
    default: false
  },
  USE_PARTIAL_URL_SEARCH: {
    default: false
  },
  USE_TAG_LIST: {
    default: true
  },
  URL_SHOW_AUTHOR_TAGS: {
    default: true,
  },
  YOUTUBE_HIDE_PAGE_HEADER: {
    default: true
  },
  YOUTUBE_REDIRECT_CHANNEL_TO_VIDEOS: {
    default: true
  },
}

// used for migrations
const DATA_FORMAT = 20250520;

const INTERNAL_VALUES_META = {
  TAG_LIST_IS_OPEN: {
    default: false,
    storage: STORAGE_TYPE.SESSION,
  },
  TAG_LIST_SESSION_STARTED: {
    default: false,
    storage: STORAGE_TYPE.SESSION,
  },
  TAG_LIST_RECENT_MAP: {
    default: {},
  },
  TAG_LIST_FIXED_MAP: {
    default: {},
  },
  TAG_LIST_AVAILABLE_ROWS: {
    default: 35,
  },
  BROWSER_START_TIME: {
    storage: STORAGE_TYPE.SESSION,
  },
  DATA_FORMAT: {
    default: 20240101,
  },
}

const userOptionSet = new Set(Object.keys(USER_OPTION_META))
const internalValuesSet = new Set(Object.keys(INTERNAL_VALUES_META))
const intersectSet = userOptionSet.intersection(internalValuesSet)

if (intersectSet.size > 0) {
  throw new Error(`User options and internal keys has intersection: ${Array.from(intersectSet.keys())}`)
}

// it is used inside getOptions()/setOptions() only
const STORAGE_KEY_META = Object.fromEntries(
  Object.entries({ ...USER_OPTION_META, ...INTERNAL_VALUES_META })
    .map(([key, obj]) => [key, {
      ...obj,
      storageKey: obj.storageKey || key,
      storage: obj.storage || STORAGE_TYPE.LOCAL
    }])
)

// it is used to read one option value in program code
const USER_OPTION = Object.fromEntries(
  Object.keys(USER_OPTION_META).map((key) => [key, key])
)
// it is used in extensionSettings to read ALL user options from storage to program
const USER_OPTION_KEY_LIST = Object.keys(USER_OPTION_META)

// it is used in storage controller to detect user options was changed
const USER_OPTION_STORAGE_KEY_LIST = USER_OPTION_KEY_LIST.map((key) => STORAGE_KEY_META[key].storageKey)

const INTERNAL_VALUES = Object.fromEntries(
  Object.keys(INTERNAL_VALUES_META).map((key) => [key, key])
)
const logModuleList = [
  // 'bookmarks.controller.js',
  // 'bookmark-create.js',
  // 'bookmark-ignore.js',
  // 'bookmarkQueue.js',
  // 'browserStartTime',
  // 'cache',
  // 'clear-url.js',
  // 'clearUrlInActiveTab.js',
  // 'commands.controller',
  // 'contextMenu.controller',
  // 'folderCreator.js',
  // 'extensionSettings.js',
  // 'folderQueue.js',
  // 'find-create.js',
  // 'find-folder.js',
  // 'folder-ignore.js',
  // 'get-bookmarks.api.js',
  // 'getUrlFromUrl',
  // 'history.api',
  // 'incoming-message.js',
  // 'incoming-message.js/TAB_IS_READY',
  // 'incoming-message.js/PAGE_EVENT',
  // 'init-extension',
  // 'memo',
  // 'mergeFolders.js',
  // 'moveFolders.js',
  // 'moveOldDatedFolders.js',
  // 'orderBookmarks.js',
  // 'page.api.js',
  // 'pageReady.js',
  // 'runtime.controller',
  // 'showAuthorBookmarks.js',
  // 'storage.api.js',
  // 'storage.controller',
  // 'updateTab.js',
  // 'tabs.controller.js',
  // 'tagList-getRecent.js',
  // 'tagList-highlight.js',
  // 'tagList.js',
  // 'url-is.js',
  // 'url-search.js',
  // 'url-settings.js',
  // 'visited-urls.js',
  // 'windows.controller',
]
const logModuleMap = Object.fromEntries(
  logModuleList.map((moduleKey) => [moduleKey, true])
)
const DEFAULT_HOST_SETTINGS = {
  isHashRequired: false,
  searchParamList: [
    '*id',
    ['any'],
    ['email_hash'],
    ['pid=0'],
    ['sent_date'],
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

const HOST_URL_SETTINGS = Object.assign(
  {},
  urlSettingsGo,
  urlSettingsUse,
  urlSettingsEnt,
  urlSettingsDark,
  urlSettingsRu,
)
const HOST_URL_SETTINGS_SHORT = Object.assign(
  {},
  urlSettingsGo,
  urlSettingsUse,
  urlSettingsEnt,
)

// async function getBookmarkList(idList) {
//   if (!(Array.isArray(idList) && idList.length > 0)) {
//     return []
//   }

//   const list = await browser.bookmarks.get(idList)

//   return list
// }

async function getBookmarkListDirty(idList) {
  if (!(Array.isArray(idList) && idList.length > 0)) {
    return []
  }

  const resultList = await Promise.allSettled(
    idList.map(
      (id) => browser.bookmarks.get(id)
    )
  )

  return resultList
    .map((result) => result.value)
    .filter(Boolean)
    .flat()
}

async function getBookmarkListWithParent({ url }) {
  if (url.startsWith('chrome:') || url.startsWith('about:')) {
    return []
  }

  const bookmarkList = await browser.bookmarks.search({ url });

  const parentIdList = bookmarkList.map(({ parentId }) => parentId).filter(Boolean)
  const uniqueParentIdList = Array.from(new Set(parentIdList))
  let parentFolderList = []

  if (0 < uniqueParentIdList.length) {
    parentFolderList = await getBookmarkListDirty(uniqueParentIdList)
  }

  const parentMap = Object.fromEntries(
    parentFolderList
      .map(({ id, title }) => [id, title])
  )

  const resultList = bookmarkList
    .map((bookmark) => ({ parentTitle: parentMap[bookmark.parentId] || '', ...bookmark }))

  return resultList
}
const MS_DIFF_FOR_SINGLE_BKM = 80

function debounce(func, timeout = 300){
  let timer;

  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(
      () => {
        func.apply(this, args);
      },
      timeout,
    );
  };
}

function debounce_leading3(func, timeout = 300){
  let timer;
  let nDeferred = 0

  return (...args) => {
    nDeferred = nDeferred + 1

    if (!timer) {
      nDeferred = 0
      func.apply(this, args);
    }

    clearTimeout(timer);
    timer = setTimeout(
      () => {
        timer = undefined;
        if (0 < nDeferred) {
          func.apply(this, args);
        }
      },
      timeout,
    );
  };
}

function ignoreBatch(func, timeout = MS_DIFF_FOR_SINGLE_BKM){
  let lastCallTime
  let timer;
  let isBatch

  return (...args) => {
    const now = Date.now()

    if (lastCallTime) {
      isBatch = now - lastCallTime < MS_DIFF_FOR_SINGLE_BKM
    } else {
      isBatch = false
    }

    lastCallTime = now

    clearTimeout(timer);

    timer = setTimeout(
      () => {
        if (!isBatch) {
          func.apply(this, args);
        }
      },
      timeout,
    );
  };
}

const isNotEmptyArray = (ar) => Array.isArray(ar) && ar.length > 0
const pluralRules = [];
const singularRules = [];
const uncountables = {};
const irregularPlurals = {};
const irregularSingles = {};

function sanitizeRule (rule) {
  if (typeof rule === 'string') {
    return new RegExp('^' + rule + '$', 'i');
  }

  return rule;
}

function addPluralRule(rule, replacement) {
  pluralRules.push([sanitizeRule(rule), replacement]);
};

function addSingularRule(rule, replacement) {
  singularRules.push([sanitizeRule(rule), replacement]);
};

function addUncountableRule(word) {
  if (typeof word === 'string') {
    uncountables[word.toLowerCase()] = true;
    return;
  }

  // Set singular and plural references for the word.
  addPluralRule(word, '$0');
  addSingularRule(word, '$0');
};

function addIrregularRule(single, plural) {
  plural = plural.toLowerCase();
  single = single.toLowerCase();

  irregularSingles[single] = plural;
  irregularPlurals[plural] = single;
};

/**
 * Irregular rules.
 */
[
  // Pronouns.
  ['I', 'we'],
  ['me', 'us'],
  ['he', 'they'],
  ['she', 'they'],
  ['them', 'them'],
  ['myself', 'ourselves'],
  ['yourself', 'yourselves'],
  ['itself', 'themselves'],
  ['herself', 'themselves'],
  ['himself', 'themselves'],
  ['themself', 'themselves'],
  ['is', 'are'],
  ['was', 'were'],
  ['has', 'have'],
  ['this', 'these'],
  ['that', 'those'],
  ['my', 'our'],
  ['its', 'their'],
  ['his', 'their'],
  ['her', 'their'],
  // Words ending in with a consonant and `o`.
  ['echo', 'echoes'],
  ['dingo', 'dingoes'],
  ['volcano', 'volcanoes'],
  ['tornado', 'tornadoes'],
  ['torpedo', 'torpedoes'],
  // Ends with `us`.
  ['genus', 'genera'],
  ['viscus', 'viscera'],
  // Ends with `ma`.
  ['stigma', 'stigmata'],
  ['stoma', 'stomata'],
  ['dogma', 'dogmata'],
  ['lemma', 'lemmata'],
  ['schema', 'schemata'],
  ['anathema', 'anathemata'],
  // Other irregular rules.
  ['ox', 'oxen'],
  ['axe', 'axes'],
  ['die', 'dice'],
  ['yes', 'yeses'],
  ['foot', 'feet'],
  ['eave', 'eaves'],
  ['goose', 'geese'],
  ['tooth', 'teeth'],
  ['quiz', 'quizzes'],
  ['human', 'humans'],
  ['proof', 'proofs'],
  ['carve', 'carves'],
  ['valve', 'valves'],
  ['looey', 'looies'],
  ['thief', 'thieves'],
  ['groove', 'grooves'],
  ['pickaxe', 'pickaxes'],
  ['passerby', 'passersby'],
  ['canvas', 'canvases']
].forEach(function (rule) {
  return addIrregularRule(rule[0], rule[1]);
});

/**
 * Pluralization rules.
 */
[
  [/s?$/i, 's'],
  // eslint-disable-next-line no-control-regex
  [/[^\u0000-\u007F]$/i, '$0'],
  [/([^aeiou]ese)$/i, '$1'],
  [/(ax|test)is$/i, '$1es'],
  [/(alias|[^aou]us|t[lm]as|gas|ris)$/i, '$1es'],
  [/(e[mn]u)s?$/i, '$1s'],
  [/([^l]ias|[aeiou]las|[ejzr]as|[iu]am)$/i, '$1'],
  [/(alumn|syllab|vir|radi|nucle|fung|cact|stimul|termin|bacill|foc|uter|loc|strat)(?:us|i)$/i, '$1i'],
  [/(alumn|alg|vertebr)(?:a|ae)$/i, '$1ae'],
  [/(seraph|cherub)(?:im)?$/i, '$1im'],
  [/(her|at|gr)o$/i, '$1oes'],
  [/(agend|addend|millenni|dat|extrem|bacteri|desiderat|strat|candelabr|errat|ov|symposi|curricul|automat|quor)(?:a|um)$/i, '$1a'],
  [/(apheli|hyperbat|periheli|asyndet|noumen|phenomen|criteri|organ|prolegomen|hedr|automat)(?:a|on)$/i, '$1a'],
  [/sis$/i, 'ses'],
  [/(?:(kni|wi|li)fe|(ar|l|ea|eo|oa|hoo)f)$/i, '$1$2ves'],
  [/([^aeiouy]|qu)y$/i, '$1ies'],
  [/([^ch][ieo][ln])ey$/i, '$1ies'],
  [/(x|ch|ss|sh|zz)$/i, '$1es'],
  [/(matr|cod|mur|sil|vert|ind|append)(?:ix|ex)$/i, '$1ices'],
  [/\b((?:tit)?m|l)(?:ice|ouse)$/i, '$1ice'],
  [/(pe)(?:rson|ople)$/i, '$1ople'],
  [/(child)(?:ren)?$/i, '$1ren'],
  [/eaux$/i, '$0'],
  [/m[ae]n$/i, 'men'],
  ['thou', 'you']
].forEach(function (rule) {
  return addPluralRule(rule[0], rule[1]);
});

/**
 * Singularization rules.
 */
[
  [/s$/i, ''],
  [/(ss)$/i, '$1'],
  [/(wi|kni|(?:after|half|high|low|mid|non|night|[^\w]|^)li)ves$/i, '$1fe'],
  [/(ar|(?:wo|[ae])l|[eo][ao])ves$/i, '$1f'],
  [/ies$/i, 'y'],
  [/(dg|ss|ois|lk|ok|wn|mb|th|ch|ec|oal|is|ck|ix|sser|ts|wb)ies$/i, '$1ie'],
  [/\b(l|(?:neck|cross|hog|aun)?t|coll|faer|food|gen|goon|group|hipp|junk|vegg|(?:pork)?p|charl|calor|cut)ies$/i, '$1ie'],
  [/\b(mon|smil)ies$/i, '$1ey'],
  [/\b((?:tit)?m|l)ice$/i, '$1ouse'],
  [/(seraph|cherub)im$/i, '$1'],
  [/(x|ch|ss|sh|zz|tto|go|cho|alias|[^aou]us|t[lm]as|gas|(?:her|at|gr)o|[aeiou]ris)(?:es)?$/i, '$1'],
  [/(analy|diagno|parenthe|progno|synop|the|empha|cri|ne)(?:sis|ses)$/i, '$1sis'],
  [/(movie|twelve|abuse|e[mn]u)s$/i, '$1'],
  [/(test)(?:is|es)$/i, '$1is'],
  [/(alumn|syllab|vir|radi|nucle|fung|cact|stimul|termin|bacill|foc|uter|loc|strat)(?:us|i)$/i, '$1us'],
  [/(agend|addend|millenni|dat|extrem|bacteri|desiderat|strat|candelabr|errat|ov|symposi|curricul|quor)a$/i, '$1um'],
  [/(apheli|hyperbat|periheli|asyndet|noumen|phenomen|criteri|organ|prolegomen|hedr|automat)a$/i, '$1on'],
  [/(alumn|alg|vertebr)ae$/i, '$1a'],
  [/(cod|mur|sil|vert|ind)ices$/i, '$1ex'],
  [/(matr|append)ices$/i, '$1ix'],
  [/(pe)(rson|ople)$/i, '$1rson'],
  [/(child)ren$/i, '$1'],
  [/(eau)x?$/i, '$1'],
  [/men$/i, 'man']
].forEach(function (rule) {
  return addSingularRule(rule[0], rule[1]);
});

/**
 * Uncountable rules.
 */
[
  // Singular words with no plurals.
  'adulthood',
  'advice',
  'agenda',
  'aid',
  'aircraft',
  'alcohol',
  'ammo',
  'analytics',
  'anime',
  'athletics',
  'audio',
  'bison',
  'blood',
  'bream',
  'buffalo',
  'butter',
  'carp',
  'cash',
  'chassis',
  'chess',
  'clothing',
  'cod',
  'commerce',
  'cooperation',
  'corps',
  'debris',
  'diabetes',
  'digestion',
  'elk',
  'energy',
  'equipment',
  'excretion',
  'expertise',
  'firmware',
  'flounder',
  'fun',
  'gallows',
  'garbage',
  'graffiti',
  'hardware',
  'headquarters',
  'health',
  'herpes',
  'highjinks',
  'homework',
  'housework',
  'information',
  'jeans',
  'justice',
  'kudos',
  'labour',
  'literature',
  'machinery',
  'mackerel',
  'mail',
  'media',
  'mews',
  'moose',
  'music',
  'mud',
  'manga',
  'news',
  'only',
  'personnel',
  'pike',
  'plankton',
  'pliers',
  'police',
  'pollution',
  'premises',
  'rain',
  'research',
  'rice',
  'salmon',
  'scissors',
  'series',
  'sewage',
  'shambles',
  'shrimp',
  'software',
  'staff',
  'swine',
  'tennis',
  'traffic',
  'transportation',
  'trout',
  'tuna',
  'wealth',
  'welfare',
  'whiting',
  'wildebeest',
  'wildlife',
  'you',
  /pok[eé]mon$/i,
  // Regexes.
  /[^aeiou]ese$/i, // "chinese", "japanese"
  /deer$/i, // "deer", "reindeer"
  /fish$/i, // "fish", "blowfish", "angelfish"
  /measles$/i,
  /o[iu]s$/i, // "carnivorous"
  /pox$/i, // "chickpox", "smallpox"
  /sheep$/i
].forEach(addUncountableRule);
const isHasOwnProperty = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop)

function restoreCase (word, token) {
  // Tokens are an exact match.
  if (word === token) return token;

  // Lower cased words. E.g. "hello".
  if (word === word.toLowerCase()) return token.toLowerCase();

  // Upper cased words. E.g. "WHISKY".
  if (word === word.toUpperCase()) return token.toUpperCase();

  // Title cased words. E.g. "Title".
  if (word[0] === word[0].toUpperCase()) {
    return token.charAt(0).toUpperCase() + token.substr(1).toLowerCase();
  }

  // Lower cased words. E.g. "test".
  return token.toLowerCase();
}

function interpolate (str, args) {
  return str.replace(/\$(\d{1,2})/g, function (match, index) {
    return args[index] || '';
  });
}

function replace (word, rule) {
  return word.replace(rule[0], function (match, index) {
    var result = interpolate(rule[1], arguments);

    if (match === '') {
      return restoreCase(word[index - 1], result);
    }

    return restoreCase(match, result);
  });
}

function sanitizeWord (token, word, rules) {
  // Empty string or doesn't need fixing.
  if (!token.length || isHasOwnProperty(uncountables, token)) {
    return word;
  }

  var len = rules.length;

  // Iterate over the sanitization rules and use the first one to match.
  while (len--) {
    var rule = rules[len];

    if (rule[0].test(word)) return replace(word, rule);
  }

  return word;
}

function replaceWord (replaceMap, keepMap, rules) {
  return function (word) {
    // Get the correct token and case restoration functions.
    var token = word.toLowerCase();

    // Check against the keep object map.
    if (isHasOwnProperty(keepMap, token)) {
      return restoreCase(word, token);
    }

    // Check against the replacement map for a direct word replacement.
    if (isHasOwnProperty(replaceMap, token)) {
      return restoreCase(word, replaceMap[token]);
    }

    // Run all the rules against the word.
    return sanitizeWord(token, word, rules);
  };
}

function checkWord (replaceMap, keepMap, rules) {
  return function (word) {
    var token = word.toLowerCase();

    if (isHasOwnProperty(keepMap, token)) return true;
    if (isHasOwnProperty(replaceMap, token)) return false;

    return sanitizeWord(token, token, rules) === token;
  };
}

// eslint-disable-next-line no-unused-vars
const plural = replaceWord(
  irregularSingles, irregularPlurals, pluralRules
);

// eslint-disable-next-line no-unused-vars
const isPlural = checkWord(
  irregularSingles, irregularPlurals, pluralRules
);

const singular = replaceWord(
  irregularPlurals, irregularSingles, singularRules
);

// eslint-disable-next-line no-unused-vars
const isSingular = checkWord(
  irregularPlurals, irregularSingles, singularRules
);
const makeLogWithTime = () => {
  let startTime;
  let prevLogTime;

  return function () {
    if (!startTime) {
      startTime = Date.now();
      prevLogTime = startTime;
    }

    const newLogTime = Date.now();
    // const dif = (newLogTime - prevLogTime)/1000;
    const dif = (newLogTime - prevLogTime);
    prevLogTime = newLogTime;

    const ar = Array.from(arguments);
    ar.unshift(`+${dif}`);
    console.log(...ar);
  }
}

const logWithTime = makeLogWithTime();

// eslint-disable-next-line no-unused-vars
const makeLogWithPrefixAndTime = (prefix = '') => {
  return function () {
    const ar = Array.from(arguments);

    if (prefix) {
      ar.unshift(prefix);
    }

    logWithTime(...ar);
  }
}

const makeLogFunction = ({ module }) => {

  const isLogging = logModuleMap[module] || false

  if (!isLogging) {
    return () => {}
  }

  let prefix = module;
  if (prefix.endsWith('.js')) {
    prefix = prefix.slice(0, -3)
  }

  return function () {
    const ar = Array.from(arguments);
    ar.unshift(prefix);
    console.log(...ar);
  }
}
const logSA = makeLogFunction({ module: 'storage.api.js' })

async function setOptions(obj) {
  const entryList = Object.entries(obj)
    .map(([key, value]) => ({
      key,
      storage: STORAGE_KEY_META[key].storage,
      value,
    }))

  const localList = entryList
    .filter((item) => item.storage === STORAGE_TYPE.LOCAL)
  const localObj = Object.fromEntries(
    localList.map(({ key, value }) => [STORAGE_KEY_META[key].storageKey, value])
  )

  const sessionList = entryList
    .filter((item) => item.storage === STORAGE_TYPE.SESSION)
  const sessionObj = Object.fromEntries(
    sessionList.map(({ key, value }) => [STORAGE_KEY_META[key].storageKey, value])
  )

  logSA('setOptions localObj', localObj)
  logSA('setOptions sessionObj', sessionObj)
  await Promise.all([
    localList.length > 0 && browser.storage.local.set(localObj),
    sessionList.length > 0 && browser.storage.session.set(sessionObj),
  ])
}

async function getOptions(keyList) {
  const inKeyList = Array.isArray(keyList) ? keyList : [keyList]

  const entryList = inKeyList
    .map((key) => ({
      key,
      storage: STORAGE_KEY_META[key].storage,
    }))

  const localList = entryList
    .filter((item) => item.storage === STORAGE_TYPE.LOCAL)
    .map(({ key }) => key)

  const sessionList = entryList
    .filter((item) => item.storage === STORAGE_TYPE.SESSION)
    .map(({ key }) => key)

  const [
    localStoredObj,
    sessionStoredObj,
  ] = await Promise.all([
    localList.length > 0
      ? browser.storage.local.get(
        localList.map((key) => STORAGE_KEY_META[key].storageKey)
      )
      : {},
    sessionList.length > 0
      ? browser.storage.session.get(
        sessionList.map((key) => STORAGE_KEY_META[key].storageKey)
      )
      : {},
  ])

  const localObj = Object.fromEntries(
    localList.map((key) => {
      const storageKey = STORAGE_KEY_META[key].storageKey

      return [
        key,
        localStoredObj[storageKey] !== undefined
          ? localStoredObj[storageKey]
          : STORAGE_KEY_META[key].default
      ]
    })
  )
  const sessionObj = Object.fromEntries(
    sessionList.map((key) => {
      const storageKey = STORAGE_KEY_META[key].storageKey

      return [
        key,
        sessionStoredObj[storageKey] !== undefined
          ? sessionStoredObj[storageKey]
          : STORAGE_KEY_META[key].default
      ]
    })
  )

  return {
    ...localObj,
    ...sessionObj,
  }
}
const logC = makeLogFunction({ module: 'cache' })

class CacheWithLimit {
  constructor ({ name='cache', size = 100 }) {
    this.cache = new Map();
    this.LIMIT = size;
    this.name = name;
  }
  removeStale () {
    if (this.LIMIT + 100 < this.cache.size) {
      let deleteCount = this.cache.size - this.LIMIT;
      const keyToDelete = [];

      // Map.key() returns keys in insertion order
      for (const key of this.cache.keys()) {
        keyToDelete.push(key);
        deleteCount -= 1;
        if (deleteCount <= 0) {
          break;
        }
      }

      for (const key of keyToDelete) {
        this.cache.delete(key);
      }
    }
  }

  add (key,value) {
    this.cache.set(key, value);
    logC(`   ${this.name}.add: ${key}`, value);

    this.removeStale();
  }

  get(key) {
    const value = this.cache.get(key);
    logC(`   ${this.name}.get: ${key}`, value);

    return value;
  }

  delete(key) {
    this.cache.delete(key);
    logC(`   ${this.name}.delete: ${key}`);
  }

  clear() {
    this.cache.clear();
    logC(`   ${this.name}.clear()`);
  }

  has(key) {
    return this.cache.has(key);
  }

  print() {
    logC(this.cache);
  }
}
class ExtraMap extends Map {
  sum(key, addValue) {
    super.set(key, (super.get(key) || 0) + addValue)
  }
  update(key, updateObj) {
    super.set(key, {
      ...super.get(key),
      ...updateObj,
    })
  }
  concat(key, inItem) {
    const item = inItem === undefined ? [] : inItem
    // item -- single item or array
    const ar = super.get(key) || []
    super.set(key, ar.concat(item))
  }
}

function getTitleDetails(title) {
  const partList = title
    .split(' ')
    .filter(Boolean)

  const objDirectives = {}
  let i = partList.length - 1

  while (-1 < i) {
    const lastWord = partList[i]
    const isDirective = lastWord.startsWith('#') || lastWord.startsWith(':')

    if (isDirective) {
      let key = lastWord.toLowerCase()
      let value = ''

      if (key.startsWith('#') && key != '#top') {
        key = '#color'
        value = key.slice(1).toUpperCase()
      }

      objDirectives[key] = value;
    } else {
      break
    }

    i = i - 1
  }

  const wordList = partList.slice(0, i+1)
  const onlyTitle = wordList.join(' ')

  return {
    onlyTitle,
    objDirectives,
  }
}

function getTitleWithDirectives({ onlyTitle, objDirectives }) {
  const strDirectives = Object.entries(objDirectives)
    .toSorted((a,b) => a[0].localeCompare(b[0]))
    .map(([key,value]) => (key == '#color'
      ? `#${value}`
      : key
    ))
    .join(' ')

    return [onlyTitle, strDirectives].filter(Boolean).join(' ')
}

function isChangesInDirectives({ oldDirectives, newDirectives }) {
  for (const key in newDirectives) {
    if (!(key in oldDirectives)) {
      return true
    }

    if (oldDirectives[key] != newDirectives[key]) {
      return true
    }
  }

  return false
}
const dateFormatter = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric'})
const weekdayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'short' })
const futureDate = new Date('01/01/2125')
const oneDayMs = 24*60*60*1000
const weekdaySet = new Set(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'])

const DATED_TEMPLATE_VISITED = 'visited @D'
const DATED_TEMPLATE_OPENED = 'opened @D'

const isWeekday = (str) => weekdaySet.has(str)

const inRange = ({ n, from, to }) => {
  if (!Number.isInteger(n)) {
    return false
  }

  if (from != undefined && !(from <= n)) {
    return false
  }

  if (to != undefined && !(n <= to)) {
    return false
  }

  return true
}

const isDate = (str) => {
  const partList = str.split('-')

  if (!(partList.length == 3)) {
    return false
  }

  const D = parseInt(partList.at(-3), 10)
  const M = parseInt(partList.at(-2), 10)
  const Y = parseInt(partList.at(-1), 10)

  return inRange({ n: D, from: 1, to: 31 }) && inRange({ n: M, from: 1, to: 12 }) && inRange({ n: Y, from: 2025 })
}

function isDatedFolderTemplate(folderTitle) {
  return folderTitle.endsWith(' @D') && 3 < folderTitle.length
}

function getDatedTitle(folderTitle) {
  const fixedPart = folderTitle.slice(0, -3).trim()

  const today = new Date()
  const sToday = dateFormatter.format(today).replaceAll('/', '-')
  const sWeekday = weekdayFormatter.format(today)

  const days = Math.floor((futureDate - today)/oneDayMs)
  const order = new Number(days).toString(36).padStart(3,'0')

  return `${fixedPart} ${sToday} ${sWeekday} ${order}`
}

function compareDatedTitle(a,b) {
  const orderA = a.slice(-3)
  const restA = a.slice(0, -4)

  const orderB = b.slice(-3)
  const restB = b.slice(0, -4)

  return (orderA || '').localeCompare(orderB || '') || (restA || '').localeCompare(restB || '')
}

function makeCompareDatedTitleWithFixed(a) {
  const orderA = a.slice(-3)
  const restA = a.slice(0, -4)

  return function compareDatedTitleWithFixed(b) {
    const orderB = b.slice(-3)
    const restB = b.slice(0, -4)

    return (orderA || '').localeCompare(orderB || '') || (restA || '').localeCompare(restB || '')
  }
}

function isDatedFolderTitle(str) {
  const partList = str.split(' ')

  if (!(4 <= partList.length)) {
    return false
  }

  const result = isWeekday(partList.at(-2)) && partList.at(-1).length == 3 && isDate(partList.at(-3)) && !!partList.at(-4)

  return result
}

function isDatedTitleForTemplate({ title, template }) {
  if (!isDatedFolderTemplate(template)) {
    return false
  }
  if (!isDatedFolderTitle(title)) {
    return false
  }

  const fixedPartFromTitle = title.split(' ').slice(0, -3).join(' ')
  const fixedPartFromTemplate = template.slice(0, -3).trim()

  return fixedPartFromTitle == fixedPartFromTemplate
}

function getDatedTemplate(title) {
  const fixedPartFromTitle = title.split(' ').slice(0, -3).join(' ')

  return `${fixedPartFromTitle} @D`
}

function isVisitedDatedTemplate(templateTitle) {
  return templateTitle == DATED_TEMPLATE_VISITED
    || templateTitle == DATED_TEMPLATE_OPENED
}

function isVisitedDatedTitle(title) {
  return (
    (title.startsWith('visited ') && isDatedTitleForTemplate({ title, template: DATED_TEMPLATE_VISITED }))
    || (title.startsWith('opened ') && isDatedTitleForTemplate({ title, template: DATED_TEMPLATE_OPENED }))
  )
}
const isDescriptiveFolderTitle = (title) => !!title
  && !(
    title.startsWith('New folder')
    || title.startsWith('[Folder Name]')
    || title.startsWith('New Folder')
    || title.startsWith('(to title)')
  )

const trimTitle = (title) => title
  .trim()
  .replace(/\s+/, ' ')

const trimLow = (title) => {
  const trimmedTitle = title
    .trim()
    .replace(/\s+/, ' ')
    .toLowerCase()

  return trimmedTitle
}

const trimLowSingular = (title) => {
  const trimmedTitle = trimLow(title)

  const wordList = trimmedTitle.split(' ')
  const lastWord = wordList.at(-1)
  const singularLastWord = singular(lastWord)
  const normalizedWordList = wordList.with(-1, singularLastWord)
  const normalizedTitle = normalizedWordList.join(' ')

  return normalizedTitle
}

const normalizeTitle = (title) => trimLowSingular(title.replaceAll('-', ''))

const getTitleForPattern = (title) => {
  let result

  if (isDatedFolderTitle(title)) {
    result = getDatedTemplate(title)
  } else {
    result = getTitleDetails(title).onlyTitle
  }

  return result
}
const ROOT_FOLDER_ID = IS_BROWSER_FIREFOX ? 'root________' : '0'
const BOOKMARKS_BAR_FOLDER_ID = IS_BROWSER_FIREFOX ? 'toolbar_____' : '1'
const BOOKMARKS_MENU_FOLDER_ID = IS_BROWSER_FIREFOX ? 'menu________' : undefined
const OTHER_BOOKMARKS_FOLDER_ID = IS_BROWSER_FIREFOX ? 'unfiled_____' : '2'
const MOBILE_BOOKMARKS_FOLDER_ID = IS_BROWSER_FIREFOX ? 'mobile______' : undefined

// eslint-disable-next-line no-unused-vars
const BUILTIN_BROWSER_FOLDER_MAP = Object.fromEntries(
  [
    ROOT_FOLDER_ID,
    BOOKMARKS_BAR_FOLDER_ID,
    OTHER_BOOKMARKS_FOLDER_ID,

    BOOKMARKS_MENU_FOLDER_ID,
    MOBILE_BOOKMARKS_FOLDER_ID,
  ].filter(Boolean)
    .map((id) => [id, true])
)
const BUILTIN_BROWSER_ROOT_FOLDER_MAP = Object.fromEntries(
  [
    BOOKMARKS_BAR_FOLDER_ID,
    BOOKMARKS_MENU_FOLDER_ID,
    OTHER_BOOKMARKS_FOLDER_ID
  ].filter(Boolean)
    .map((id) => [id, true])
)

const DATED_ROOT_NEW = '@D new'
const DATED_ROOT_OLD = '@D old'
const UNCLASSIFIED_TITLE = 'zz-bookmark-info--unclassified'

const mapSpecialTitle = new Set([
  DATED_ROOT_NEW,
  DATED_ROOT_OLD,
  UNCLASSIFIED_TITLE,
])

function isSpecialFolderTitle(title) {
  return mapSpecialTitle.has(title)
}
const logFF = makeLogFunction({ module: 'find-folder.js' })

async function findFolderWithExactTitle(title) {
  const nodeList = await browser.bookmarks.search({ title });
  const foundItem = nodeList.find((node) => !node.url)

  return foundItem
}

async function findSubFolderWithExactTitle({ title, parentId }) {
  const nodeList = await browser.bookmarks.search({ title });
  const foundItem = nodeList.find((node) => !node.url && node.parentId == parentId)

  return foundItem
}

function makeIsTitleMatch({ title, normalizeFn = (str) => str }) {
  const onlyTitlePattern = getTitleForPattern(title).onlyTitle
  const normalizedPattern = normalizeFn(onlyTitlePattern)

  return function isTitleMatch(testTitle) {
    const onlyTitleTestTitle = getTitleForPattern(testTitle).onlyTitle
    const normalizedTestTitle = normalizeFn(onlyTitleTestTitle)

    if (normalizedTestTitle === normalizedPattern) {
      return true
    }

    return false
  }
}

async function findByTitle({ title, normalizeFn }) {
  let foundItem
  const bookmarkList = await browser.bookmarks.search(title);
  const isTitleMatch = makeIsTitleMatch({ title, normalizeFn })

  let i = 0
  while (!foundItem && i < bookmarkList.length) {
    const checkItem = bookmarkList[i]
    if (!checkItem.url && isTitleMatch(checkItem.title)) {
      foundItem = checkItem
    }
    i += 1
  }

  return foundItem
}

// example1: node.js -> NodeJS
async function findTitleEndsWithJS(title) {
  const lowTitle = trimLow(title)
  if (!lowTitle.endsWith('.js')) {
    return
  }

  const noDotTitle = `${lowTitle.slice(0, -3)}js`
  const foundItem = await findByTitle({ title: noDotTitle, normalizeFn: trimLow })

  return foundItem
}

// example1: e-commerce -> ecommerce
// example2: micro-frontend -> microfrontend
async function findTitleRemoveDash(title) {
  if (title.indexOf('-') == -1) {
    return
  }

  const noDashTitle = title.replaceAll('-', '')
  const foundItem = await findByTitle({ title: noDashTitle, normalizeFn: trimLowSingular })

  return foundItem
}

// example1: micro-frontend -> micro frontend
async function findTitleReplaceDashToSpace(title) {
  if (title.indexOf('-') == -1) {
    return
  }

  const dashToSpaceTitle = title.replaceAll('-', ' ')
  const foundItem = await findByTitle({ title: dashToSpaceTitle, normalizeFn: trimLowSingular })

  return foundItem
}

// example1: AI Video -> ai-video
async function findTitleReplaceSpaceToDash(title) {
  const trimmedTitle = trimTitle(title)
  if (trimmedTitle.indexOf(' ') == -1) {
    return
  }

  const spaceToDashTitle = title.replaceAll(' ', '-')
  const foundItem = await findByTitle({ title: spaceToDashTitle, normalizeFn: trimLowSingular })

  return foundItem
}

async function findTitleNormalized(title) {
  const foundItem = await findByTitle({ title, normalizeFn: normalizeTitle })

  return foundItem
}

async function findTitleDropEnding(title) {
  const lowTitle = trimLow(title)
  const lastWord = lowTitle.split(' ').at(-1)

  if (!(5 < lastWord.length)) {
    return
  }

  let foundItem
  const dropEndTitle = lowTitle.slice(0, -3)
  const bookmarkList = await browser.bookmarks.search(dropEndTitle);
  const isTitleMatch = makeIsTitleMatch({ title, normalizeFn: normalizeTitle })

  let i = 0
  while (!foundItem && i < bookmarkList.length) {
    const checkItem = bookmarkList[i]
    if (!checkItem.url && isTitleMatch(checkItem.title)) {
      foundItem = checkItem
    }
    i += 1
  }

  return foundItem
}

function findFolderFrom({ isTitleMatch, startFolder }) {
  function traverseSubFolder(folderNode) {
    if (isTitleMatch(folderNode.title)) {
      return folderNode
    }

    const folderList = folderNode.children
      .filter(({ url }) => !url)

    let foundItem
    let i = 0
    while (!foundItem && i < folderList.length) {
      foundItem = traverseSubFolder(folderList[i])
      i += 1
    }
  }

  return traverseSubFolder(startFolder)
}

async function findFolderInSubtree({ title, parentId }) {
  const normalizedTitle = normalizeTitle(title)
  logFF('findFolderInSubtree 00 normalizedTitle', normalizedTitle, parentId)
  // search in direct children
  const isTitleMatch = makeIsTitleMatch({ title, normalizeFn: normalizeTitle })

  const firstLevelNodeList = await browser.bookmarks.getChildren(parentId)
  let foundItem = firstLevelNodeList.find((node) => !node.url && isTitleMatch(node.title))
  logFF('findFolderInSubtree 11 firstLevelNodeList', foundItem)

  if (!foundItem) {
    // search in subfolders of direct children
    const [otherBookmarks] = await browser.bookmarks.getSubTree(parentId)
    const batchList = []

    for (const firstLevelNode of otherBookmarks.children) {
      if (!firstLevelNode.url) {
        const secondLevelFolderList = firstLevelNode.children.filter(({ url }) => !url)
        batchList.push(secondLevelFolderList)
      }
    }

    const allSecondLevelFolderList = batchList.flat()

    let i = 0
    while (!foundItem && i < allSecondLevelFolderList.length) {
      foundItem = findFolderFrom({ isTitleMatch, startFolder: allSecondLevelFolderList[i] })
      i += 1
    }
    logFF('findFolderInSubtree 22 secondLevelFolderList', foundItem)
  }

  return foundItem
}

async function findFolder(title) {
  logFF('findFolder 00 title', title)
  let foundItem

  if (!foundItem) {
    foundItem = await findTitleNormalized(title)
    logFF('findTitleNormalized -> ', foundItem)
  }

  if (!foundItem) {
    foundItem = await findFolderWithExactTitle(title)
    logFF('findFolderWithExactTitle -> ', foundItem)
  }

  if (!foundItem) {
    foundItem = await findTitleEndsWithJS(title)
    logFF('findTitleEndsWithJS -> ', foundItem)
  }

  if (!foundItem) {
    foundItem = await findTitleRemoveDash(title)
    logFF('findTitleRemoveDash -> ', foundItem)
  }

  if (!foundItem) {
    foundItem = await findTitleReplaceDashToSpace(title)
    logFF('findTitleReplaceDashToSpace -> ', foundItem)
  }

  if (!foundItem) {
    foundItem = await findTitleReplaceSpaceToDash(title)
    logFF('findTitleReplaceSpaceToDash -> ', foundItem)
  }

  if (!foundItem) {
    foundItem = await findTitleDropEnding(title)
    logFF('findTitleDropEnding -> ', foundItem)
  }

  if (!foundItem) {
    foundItem = await findFolderInSubtree({ title, parentId: OTHER_BOOKMARKS_FOLDER_ID })
    logFF('findFolderInSubtree OTHER_BOOKMARKS_FOLDER_ID', foundItem)
  }

  if (!foundItem) {
    foundItem = await findFolderInSubtree({ title, parentId: BOOKMARKS_BAR_FOLDER_ID })
    logFF('findFolderInSubtree BOOKMARKS_BAR_FOLDER_ID', foundItem)
  }

  return foundItem
}
function isTopFolder(folderName) {
  const name = folderName.trim().toLowerCase()

  return name.startsWith('todo')
    || name.startsWith('source')
    || name.startsWith('list') || name.endsWith('list')
    || name.endsWith('#top')
}

function getNewFolderRootId(folderName) {
  if (isTopFolder(folderName)) {
    return BOOKMARKS_BAR_FOLDER_ID
  }

  return OTHER_BOOKMARKS_FOLDER_ID
}

const logES = makeLogFunction({ module: 'extensionSettings.js' })

class ExtensionSettings {
  _isActual = false
  _settings = {}
  promise
  fnResolve
  fnReject

  isActual() {
    return this._isActual
  }
  async get() {
    await this.promise

    return { ...this._settings }
  }
  invalidate () {
    this._isActual = false
  }
  async restoreFromStorage() {
    logES('readSavedSettings START')
    this._isActual = true

    this.promise = new Promise((fnResolve, fnReject) => {
      this.fnResolve = fnResolve;
      this.fnReject = fnReject;
    });

    await getOptions(USER_OPTION_KEY_LIST)
      .then((result) => {
        this._settings = result
        this.fnResolve()
      })
      .catch(this.fnReject);

    logES('readSavedSettings')
    logES(`actual settings: ${Object.entries(this._settings).map(([k,v]) => `${k}: ${v}`).join(', ')}`)
  }

  async update(updateObj) {
    Object.entries(updateObj).forEach(([ket, value]) => {
      this._settings[ket] = value
    })

    await setOptions(updateObj)
  }
}

const extensionSettings = new ExtensionSettings()
const logPA = makeLogFunction({ module: 'page.api.js' })

async function changeUrlInTab({ tabId, url }) {
  logPA('changeUrlInTab () 00', tabId, url)
  const msg = {
    command: CONTENT_SCRIPT_MSG_ID.CHANGE_URL,
    url,
  }
  logPA('changeUrlInTab () sendMessage', tabId, msg)
  await browser.tabs.sendMessage(tabId, msg)
    .catch((err) => {
      logPA('changeUrlInTab () IGNORE', err)
    })
}

async function replaceUrlInTab({ tabId, url }) {
  logPA('replaceUrlInTab () 00', tabId, url)

  const msg = {
    command: CONTENT_SCRIPT_MSG_ID.REPLACE_URL,
    url,
  }
  logPA('changeUrlInTab () sendMessage', tabId, msg)
  await browser.tabs.sendMessage(tabId, msg)
    .catch((err) => {
      logPA('changeUrlInTab () IGNORE', err)
    })
}

async function getSelectionInPage(tabId) {
  logPA('getSelectionInPage () 00', tabId)
  const msg = {
    command: CONTENT_SCRIPT_MSG_ID.GET_SELECTION,
  }
  logPA('getSelectionInPage () sendMessage', tabId)
  await browser.tabs.sendMessage(tabId, msg)
    .catch((err) => {
      logPA('getSelectionInPage () IGNORE', err)
    })
}

async function getUserInputInPage(tabId) {
  logPA('getUserInputInPage () 00', tabId)
  const msg = {
    command: CONTENT_SCRIPT_MSG_ID.GET_USER_INPUT,
  }
  logPA('getUserInputInPage () sendMessage', tabId)
  await browser.tabs.sendMessage(tabId, msg)
    .catch((err) => {
      logPA('getUserInputInPage () IGNORE', err)
    })
}

async function toggleYoutubeHeaderInPage(tabId) {
  logPA('toggleYoutubeHeaderInPage () 00', tabId)
  const msg = {
    command: CONTENT_SCRIPT_MSG_ID.TOGGLE_YOUTUBE_HEADER,
  }
  logPA('toggleYoutubeHeaderInPage () sendMessage', tabId)
  await browser.tabs.sendMessage(tabId, msg)
    .catch((err) => {
      logPA('toggleYoutubeHeaderInPage () IGNORE', err)
    })
}

async function updateBookmarkInfoInPage({ tabId, data }) {
  logPA('updateBookmarkInfo () 00', tabId)
  const msg = {
    command: CONTENT_SCRIPT_MSG_ID.BOOKMARK_INFO,
    ...data,
  }
  logPA('updateBookmarkInfo () sendMessage', tabId)
  await browser.tabs.sendMessage(tabId, msg)
    .catch((err) => {
      logPA('updateBookmarkInfo () IGNORE', err)
    })
}

async function sendMeAuthor({ tabId, authorSelector }) {
  if (!authorSelector) {
    return
  }

  logPA('sendMeAuthor () 00', tabId)
  const msg = {
    command: CONTENT_SCRIPT_MSG_ID.SEND_ME_AUTHOR,
    authorSelector,
  }
  logPA('sendMeAuthor () sendMessage', tabId)
  await browser.tabs.sendMessage(tabId, msg)
    .catch((err) => {
      logPA('sendMeAuthor () IGNORE', err)
    })
}

const page = {
  changeUrlInTab,
  replaceUrlInTab,
  getSelectionInPage,
  getUserInputInPage,
  toggleYoutubeHeaderInPage,
  updateBookmarkInfoInPage,
  sendMeAuthor,
}
const logM = makeLogFunction({ module: 'memo' })

const memo = {
  previousTabId: '',
  activeTabId: '',
  activeTabUrl: '',

  cacheUrlToInfo: new CacheWithLimit({ name: 'cacheUrlToInfo', size: 500 }),
  // cacheUrlToVisitList: new CacheWithLimit({ name: 'cacheUrlToVisitList', size: 150 }),
  bkmFolderById: new CacheWithLimit({ name: 'bkmFolderById', size: 1000 }),
}

logM('IMPORT END', 'memo.js', new Date().toISOString())
const logBST = makeLogFunction({ module: 'browserStartTime' })

class BrowserStartTime {
  _isActual = false
  startTime
  promise
  fnResolve
  fnReject

  isActual() {
    return this._isActual
  }
  async getStartTime() {
    const storedSession = await getOptions(INTERNAL_VALUES.BROWSER_START_TIME)
    logBST('storedSession', storedSession)

    let result

    if (storedSession[INTERNAL_VALUES.BROWSER_START_TIME]) {
      result = storedSession[INTERNAL_VALUES.BROWSER_START_TIME]
    } else {
      // I get start for service-worker now.
      //    It is correct if this web-extension was installed in the previous browser session
      // It is better get for window // min(window.startTime(performance.timeOrigin)) OR min(tab(performance.timeOrigin))
      //  tab with minimal tabId
      result = performance.timeOrigin
      await setOptions({
        [INTERNAL_VALUES.BROWSER_START_TIME]: this._profileStartTimeMS
      })
    }

    return result
  }
  async init() {
    this._isActual = true

    this.promise = new Promise((fnResolve, fnReject) => {
      this.fnResolve = fnResolve;
      this.fnReject = fnReject;
    });

    await this.getStartTime()
      .then((result) => {
        this.startTime = result

        this.fnResolve()
      })
      .catch(this.fnReject)

      logBST('profileStartTimeMS', new Date(this.startTime).toISOString())
  }
  async get() {
    await this.promise

    return this.startTime
  }
}

const browserStartTime = new BrowserStartTime()
const logRA = makeLogFunction({ module: 'tagList-getRecent.js' })

async function getRecentList(nItems) {
  const list = await browser.bookmarks.getRecent(nItems);
  const folderList = list
    .filter(({ url }) => !url)

  const folderByIdMap = Object.fromEntries(
    folderList.map(({ id, title, dateAdded }) => [
      id,
      {
        title,
        dateAdded,
        isSourceFolder: true,
      }
    ])
  )

  const bookmarkList = list.filter(({ url }) => url)
  bookmarkList.forEach(({ parentId, dateAdded }) => {
    folderByIdMap[parentId] = {
      ...folderByIdMap[parentId],
      dateAdded: Math.max(folderByIdMap[parentId]?.dateAdded || 0, dateAdded)
    }
  })

  const unknownIdList = Object.entries(folderByIdMap)
    .filter(([, { isSourceFolder }]) => !isSourceFolder)
    .map(([id]) => id)

  if (unknownIdList.length > 0) {
    const unknownFolderList = await getBookmarkListDirty(unknownIdList)
    unknownFolderList.forEach(({ id, title }) => {
      folderByIdMap[id].title = title
    })
  }

  return Object.entries(folderByIdMap)
    .map(([parentId, { title, dateAdded }]) => ({ parentId, parentTitle: title, dateAdded }))
    .sort((a,b) => -(a.dateAdded - b.dateAdded))
}

async function getRecentTagObj(nItems) {
  let list = await getRecentList(nItems * 4)
  logRA('getRecentTagObj () 11', list.length, list)

  if (0 < list.length && list.length < nItems) {
    list = await getRecentList(nItems * 10)
    logRA('getRecentTagObj () 22', list.length, list)
  }

  return Object.fromEntries(
    list
      .slice(0, nItems)
      .map(({ parentId, parentTitle, dateAdded }) => [parentId, { parentTitle, dateAdded }])
  )
}

async function filterFolders(idList, isFlatStructure) {
  logRA('filterFolders () 00', idList.length, idList )
  if (idList.length === 0) {
    return []
  }

  const folderList = await getBookmarkListDirty(idList)
  logRA('filterFolders () 22', 'folderList', folderList.length, folderList)
  let filteredFolderList = folderList
    .filter(({ title }) => !!title)
    .filter(({ title }) => isDescriptiveFolderTitle(title))
    .filter(({ title }) => !isDatedFolderTitle(title))
    .filter(({ title }) => !isVisitedDatedTemplate(title))

  // FEATURE.FIX: when use flat folder structure, only fist level folder get to recent list
  if (isFlatStructure) {
    filteredFolderList = filteredFolderList
      .filter(
        ({ parentId }) => parentId === OTHER_BOOKMARKS_FOLDER_ID || parentId === BOOKMARKS_BAR_FOLDER_ID
      )
      .filter(
        ({ title }) => !isSpecialFolderTitle(title)
      )
  }
  logRA('filterFolders () 33', 'filteredFolderList', filteredFolderList.length, filteredFolderList)

  return filteredFolderList
}

async function filterRecentTagObj(obj = {}, isFlatStructure) {
  logRA('filterRecentTagObj () 00')
  const filteredFolderList = await filterFolders(Object.keys(obj), isFlatStructure)

  return Object.fromEntries(
    filteredFolderList.map(({ id, title }) => [
      id,
      {
        parentTitle: title,
        dateAdded: obj[id].dateAdded,
      }
    ])
  )
}

async function filterFixedTagObj(obj = {}, isFlatStructure) {
  logRA('filterFixedTagObj () 00')
  const filteredFolderList = await filterFolders(Object.keys(obj), isFlatStructure)

  return Object.fromEntries(
    filteredFolderList.map(({ id, title }) => [id, title])
  )
}
const logTH = makeLogFunction({ module: 'tagList-highlight.js' })

const ALLOWED_DISTANCE = 3

function getIsConditionFromUp(letterList, iTest) {
  let distanceFromUp = 0
  let i = iTest - 1

  while (-1 < i) {
    distanceFromUp += letterList[i].n

    if (ALLOWED_DISTANCE <= distanceFromUp) {
      return true
    }

    if (letterList[i].isHighlight) {
      return false
    }

    i = i - 1
  }

  return i == -1
}

function getIsConditionFromDown(letterList, iTest) {
  let distanceFromDown = 0
  let i = iTest + 1

  while (i < letterList.length) {
    distanceFromDown += letterList[i - 1].n

    if (ALLOWED_DISTANCE <= distanceFromDown) {
      return true
    }

    if (letterList[i].isHighlight) {
      return false
    }

    // epic error
    // i =+ 1
    i = i + 1
  }

  return i == letterList.length
}

function markItemInList(letterList) {
  logTH('markItemInList () 00')
  let distanceFromUp = 0
  let i = 0

  while (i < letterList.length) {
    distanceFromUp = distanceFromUp + (i == 0
      ? ALLOWED_DISTANCE
      : letterList[i - 1].n
    )

    if (letterList[i].isHighlight) {
      distanceFromUp = 0
    } else if (ALLOWED_DISTANCE <= distanceFromUp) {
      logTH('markItemInList () 11 ALLOWED_DISTANCE <= distanceFromUp', letterList[i].letter)
      const isConditionFromDown = getIsConditionFromDown(letterList, i)
      logTH('markItemInList () 11 isConditionFromDown', letterList[i].letter, isConditionFromDown)

      if (isConditionFromDown) {
        letterList[i].isHighlight = true
        distanceFromUp = 0
        logTH('markItemInList () 11 add', letterList[i].letter)
      }
    }

    i = i + 1
  }
}

function getHighlightSet(letterList = []) {
  logTH('getHighlightSet () 00', letterList)
  if (letterList.length == 0) {
    return new Set()
  }

  letterList.forEach(({ letter, n }, index, arr) => {
    if (ALLOWED_DISTANCE <= n) {
      logTH('getHighlightSet () 11 ALLOW_DISTANCE <= n', letter, n)
      arr[index].isHighlight = true
    }
  })

  const priorityCheckList = letterList
    .map(({ letter, n }, index) => ({ letter, n, index }))
    .filter(({ n }) => 1 < n && n < ALLOWED_DISTANCE)
    .toSorted((a, b) => -(a.n - b.n) || a.index - b.index)

  priorityCheckList.forEach(({ index }) => {
    const isConditionFromUp = getIsConditionFromUp(letterList, index)

    if (isConditionFromUp) {
      const isConditionFromDown = getIsConditionFromDown(letterList, index)

      if (isConditionFromDown) {
        letterList[index].isHighlight = true
      }
    }
  })

  markItemInList(letterList)

  return new Set(
    letterList
      .filter(({ isHighlight }) => isHighlight)
      .map(({ letter }) => letter)
  )
}

function getGroupedLetterList(resultList) {
  const letterToNMap = new ExtraMap()

  resultList.forEach(({ letter }) => {
    letterToNMap.sum(letter, 1)
  })

  const letterList = Array.from(letterToNMap.entries())
    .map(([letter, n]) => ({ letter, n }))
    .toSorted((a, b) => a.letter.localeCompare(b.letter))

  return letterList
}

function getFirstLetter(title) {
  return new Intl.Segmenter().segment(title).containing(0).segment.toUpperCase()
}

function highlightAlphabet({
  list = [],
  fnGetFirstLetter = ({ title }) => getFirstLetter(title),
}) {
  const midList = list.map((item) => ({
    ...item,
    letter: fnGetFirstLetter(item),
  }))

  const highlightSet = getHighlightSet(
    getGroupedLetterList(midList)
  )
  const resultList = []

  midList.forEach(({ letter, ...rest }) => {
    if (highlightSet.has(letter)) {
      resultList.push({
        ...rest,
        isHighlight: 1,
      })
      highlightSet.delete(letter)
    } else {
      resultList.push(rest)
    }
  })

  return resultList
}
const logTL = makeLogFunction({ module: 'tagList.js' })

class TagList {

  constructor () {
    this.isOn = false
    this.isRestoringDone = false

    this.isFlatStructure = false
    this.AVAILABLE_ROWS = 0
    this.MAX_AVAILABLE_ROWS = 0
    this.HIGHLIGHT_LAST = false
    this.HIGHLIGHT_ALPHABET = false
    this.PINNED_TAGS_POSITION = undefined

    this.isOpenGlobal = false

    this.changeProcessedCount = -1
    this.changeCount = 0

    this._recentTagObj = {}
    this._fixedTagObj = {}

    this.recentListDesc = []
    this.recentListLimit = []
    this.tagList = []
    this.tagListFormat = []
    this.tagIdSet = new Set()
  }

  async useSettings({ isOn, userSettings }) {
    this.isOn = isOn

    await this._readFromStorage({ userSettings })
    this.isRestoringDone = true
  }

  get nAvailableRows() {
    return this.AVAILABLE_ROWS
  }
  _markUpdates() {
    this.changeCount += 1
  }

  async _readFromStorage({ userSettings }) {
    logTL('readFromStorage () 00')

    this.isFlatStructure = userSettings[USER_OPTION.USE_FLAT_FOLDER_STRUCTURE]
    this.HIGHLIGHT_LAST = userSettings[USER_OPTION.TAG_LIST_HIGHLIGHT_LAST]
    this.HIGHLIGHT_ALPHABET = userSettings[USER_OPTION.TAG_LIST_HIGHLIGHT_ALPHABET]
    this.PINNED_TAGS_POSITION = userSettings[USER_OPTION.TAG_LIST_PINNED_TAGS_POSITION]

    const savedObj = await getOptions([
      INTERNAL_VALUES.TAG_LIST_SESSION_STARTED,
      INTERNAL_VALUES.TAG_LIST_RECENT_MAP,
      INTERNAL_VALUES.TAG_LIST_FIXED_MAP,
      INTERNAL_VALUES.TAG_LIST_IS_OPEN,
      INTERNAL_VALUES.TAG_LIST_AVAILABLE_ROWS,
    ]);
    logTL('readFromStorage () 11 savedObj')
    logTL(savedObj)
    this.isOpenGlobal = savedObj[INTERNAL_VALUES.TAG_LIST_IS_OPEN]
    this.AVAILABLE_ROWS = savedObj[INTERNAL_VALUES.TAG_LIST_AVAILABLE_ROWS]
    this.MAX_AVAILABLE_ROWS = this.AVAILABLE_ROWS

    this._recentTagObj = savedObj[INTERNAL_VALUES.TAG_LIST_RECENT_MAP] || {}
    this._fixedTagObj = savedObj[INTERNAL_VALUES.TAG_LIST_FIXED_MAP] || {}

    if (Object.keys(this._recentTagObj) < this.AVAILABLE_ROWS) {
      if (!savedObj[INTERNAL_VALUES.TAG_LIST_SESSION_STARTED]) {
        const actualRecentTagObj = await getRecentTagObj(this.AVAILABLE_ROWS)
        this._recentTagObj = {
          ...actualRecentTagObj,
          ...this._recentTagObj,
        }
      }
    }

    this._recentTagObj = await filterRecentTagObj(this._recentTagObj, this.isFlatStructure)
    this._fixedTagObj = await filterFixedTagObj(this._fixedTagObj, this.isFlatStructure)

    this._markUpdates()
    await setOptions({
      [INTERNAL_VALUES.TAG_LIST_SESSION_STARTED]: true,
      [INTERNAL_VALUES.TAG_LIST_RECENT_MAP]: this._recentTagObj,
      [INTERNAL_VALUES.TAG_LIST_FIXED_MAP]: this._fixedTagObj,
    })
  }
  async updateAvailableRows(availableRows) {
    if (!this.isOn) {
      return
    }

    if (!availableRows) {
      return
    }

    logTL('updateAvailableRows () 00', availableRows)
    const beforeAvailableRows = this.AVAILABLE_ROWS
    this.AVAILABLE_ROWS = availableRows
    this.MAX_AVAILABLE_ROWS = Math.max(this.MAX_AVAILABLE_ROWS, this.AVAILABLE_ROWS)

    const updateObj = {
      [INTERNAL_VALUES.TAG_LIST_AVAILABLE_ROWS]: availableRows,
    }

    if (beforeAvailableRows < availableRows) {
      let actualRecentTagObj = await getRecentTagObj(this.AVAILABLE_ROWS)
      this._recentTagObj = {
        ...actualRecentTagObj,
        ...this._recentTagObj,
      }
      this._recentTagObj = await filterRecentTagObj(this._recentTagObj, this.isFlatStructure)
      Object.assign(updateObj, {
        [INTERNAL_VALUES.TAG_LIST_RECENT_MAP]: this._recentTagObj,
      })
    }

    this._markUpdates()
    await setOptions(updateObj)
  }
  async openTagList(isOpen) {
    if (!this.isOn) {
      return
    }

    this.isOpenGlobal = isOpen
    await setOptions({
      [INTERNAL_VALUES.TAG_LIST_IS_OPEN]: isOpen
    })
  }
  _formatList(list) {
    // logTL('formatList () 00', list)

    const inList = list.filter(({ parentTitle }) => !!parentTitle)

    const lastTagList = this.recentListDesc
      .slice(0, this.HIGHLIGHT_LAST)

    const lastTagSet = new Set(
      lastTagList.map(({ parentId }) => parentId)
    )

    let resultList
    if (this.PINNED_TAGS_POSITION == TAG_LIST_PINNED_TAGS_POSITION_OPTIONS.TOP) {
      resultList = inList.sort((a, b) => -(+a.isFixed - b.isFixed) || a.parentTitle.localeCompare(b.parentTitle))

      if (this.HIGHLIGHT_ALPHABET) {
        resultList = highlightAlphabet({
          list: resultList,
          fnGetFirstLetter: ({ isFixed, parentTitle }) => `${isFixed ? 'F': 'R'}#${getFirstLetter(parentTitle)}`
        })
      }
    } else {
      resultList = inList.sort((a, b) => a.parentTitle.localeCompare(b.parentTitle))

      if (this.HIGHLIGHT_ALPHABET) {
        resultList = highlightAlphabet({
          list: resultList,
          fnGetFirstLetter: ({ parentTitle }) => getFirstLetter(parentTitle),
        })
      }
    }

    return resultList.map((item) => ({
      ...item,
      isLast: lastTagSet.has(item.parentId),
    }))
  }
  getListWithBookmarks(addTagList = []) {
    if (!this.isOn) {
      logTL('getListWithBookmarks () 00 RETURN ', 0)
      return []
    }

    logTL('getListWithBookmarks () 00 this.isRestoringDone', this.isRestoringDone)
    const changeCount = this.changeCount
    if (this.changeProcessedCount < changeCount) {
      // logTL('getListWithBookmarks () 11 this._recentTagObj length', Object.keys(this._recentTagObj).length )
      // logTL('getListWithBookmarks () 11 this._fixedTagObj length', Object.keys(this._fixedTagObj).length )

      this.recentListDesc = Object.entries(this._recentTagObj)
        .map(([parentId, { parentTitle, dateAdded }]) => ({ parentId, parentTitle, dateAdded }))
        .sort((a, b) => -(a.dateAdded - b.dateAdded))

      const recentTagLimit = Math.max(
        this.AVAILABLE_ROWS - Object.keys(this._fixedTagObj).length,
        0
      )

      this.recentListLimit = this.recentListDesc
        .filter(({ parentId }) => !(parentId in this._fixedTagObj))
        .slice(0, recentTagLimit)

      // logTL('getListWithBookmarks () 11 this.AVAILABLE_ROWS', this.AVAILABLE_ROWS )
      // logTL('getListWithBookmarks () 11 recentTagLimit', recentTagLimit )
      // logTL('getListWithBookmarks () 11 this.recentListDesc length', this.recentListDesc.length )
      // logTL('getListWithBookmarks () 11 this.recentListLimit length', this.recentListLimit.length )

      this.tagList  = [].concat(
        Object.entries(this._fixedTagObj)
          .map(([parentId, parentTitle]) => ({
            parentId,
            parentTitle,
            isFixed: true,
          })),
        this.recentListLimit
          .map(({ parentId, parentTitle }, index) => ({ parentId, parentTitle, isFixed: false, ageIndex: index })),
      )


      this.tagIdSet = new Set(this.tagList.map(({ parentId }) => parentId))

      this.tagListFormat = this._formatList(this.tagList)
      // logTL('getListWithBookmarks () 11 this.tagList length', this.tagList.length )
      // logTL('getListWithBookmarks () 11 this.tagListFormat length', this.tagListFormat.length )

      if (this.changeProcessedCount < changeCount) {
        this.changeProcessedCount = changeCount
      }
    }


    logTL('getListWithBookmarks () 22')
    const finalAddTagList = addTagList
      .filter(({ parentId }) => !this.tagIdSet.has(parentId))

    const requiredSlots = finalAddTagList.length

    if (requiredSlots === 0) {
      logTL('getListWithBookmarks () 33 RETURN ', this.tagListFormat.length)
      // logTL(this.tagListFormat)
      return this.tagListFormat
    }

    logTL('getListWithBookmarks () 44 finalAddTagList', finalAddTagList)
    const addSet = new Set(addTagList.map(({ parentId }) => parentId))

    const availableSlots = Math.max(0, this.AVAILABLE_ROWS - this.tagList.length)
    const replaceSlots = Math.max(0, requiredSlots - availableSlots)
    const replaceList = finalAddTagList.slice(0, replaceSlots)
    const connectList = finalAddTagList.slice(replaceSlots)

    let resultList = this.tagList.slice()

    if (0 < replaceList.length) {

      let iTo = resultList.length - 1
      let iFrom = replaceList.length - 1

      while (-1 < iFrom && -1 < iTo) {
        const item = resultList[iTo]

        if (!item.isFixed && !addSet.has(item.parentId)) {
          resultList[iTo].parentId = replaceList[iFrom].parentId
          resultList[iTo].parentTitle = replaceList[iFrom].parentTitle
          iFrom = iFrom - 1
        }
        iTo = iTo - 1
      }
    }
    if (0 < connectList.length) {
      const ageIndex = this.recentListLimit.length
      resultList = resultList.concat(
        connectList.map(({ parentId, parentTitle }) => ({ parentId, parentTitle, isFixed: false, ageIndex }))
      )
    }

    const tagListFormatWith = this._formatList(resultList)
    logTL('getListWithBookmarks () RETURN 99', tagListFormatWith.length)

    return tagListFormatWith
  }
  async addTag({ parentId, parentTitle }) {
    if (!this.isOn) {
      return
    }

    logTL('addTag 00', parentId, parentTitle)
    // FEATURE.FIX: when use flat folder structure, only fist level folder get to recent list
    if (this.isFlatStructure) {
      // if (!(newFolder.parentId === OTHER_BOOKMARKS_FOLDER_ID)) {
      //   return
      // }

      if (isSpecialFolderTitle(parentTitle)) {
        return
      }
    }

    if (!isDescriptiveFolderTitle(parentTitle)) {
      return
    }

    if (isDatedFolderTitle(parentTitle)) {
      return
    }

    this._recentTagObj[parentId] = {
      dateAdded: Date.now(),
      parentTitle,
    }

    let fixedTagUpdate
    if (parentId in this._fixedTagObj) {
      this._fixedTagObj[parentId] = parentTitle
      fixedTagUpdate = {
        [INTERNAL_VALUES.TAG_LIST_FIXED_MAP]: this._fixedTagObj
      }
    }

    if (this.MAX_AVAILABLE_ROWS && this.MAX_AVAILABLE_ROWS + 20 < Object.keys(this._recentTagObj).length) {
      const redundantIdList = Object.entries(this._recentTagObj)
        .map(([parentId, { parentTitle, dateAdded }]) => ({ parentId, parentTitle, dateAdded }))
        .sort((a, b) => -(a.dateAdded - b.dateAdded))
        .slice(this.MAX_AVAILABLE_ROWS)
        .map(({ parentId }) => parentId)

      redundantIdList.forEach((id) => {
        delete this._recentTagObj[id]
      })
    }

    this._markUpdates()
    await setOptions({
      [INTERNAL_VALUES.TAG_LIST_RECENT_MAP]: this._recentTagObj,
      ...fixedTagUpdate,
    })
  }
  async removeTag(id) {
    if (!this.isOn) {
      return
    }

    const isInFixedList = id in this._fixedTagObj
    let fixedTagUpdate

    if (isInFixedList) {
      delete this._fixedTagObj[id]
      fixedTagUpdate = {
        [INTERNAL_VALUES.TAG_LIST_FIXED_MAP]: this._fixedTagObj
      }
    }

    const isInRecentList = id in this._recentTagObj
    let recentTagUpdate

    if (isInRecentList) {
      delete this._recentTagObj[id]
      recentTagUpdate = {
        [INTERNAL_VALUES.TAG_LIST_RECENT_MAP]: this._recentTagObj
      }
    }

    if (isInFixedList || isInRecentList) {
      this._markUpdates()
      await setOptions({
        ...fixedTagUpdate,
        ...recentTagUpdate,
      })
    }
  }
  async fixTag({ parentId, parentTitle }) {
    if (!this.isOn) {
      return
    }

    if (!parentTitle || !parentId) {
      return
    }

    if (!(parentId in this._fixedTagObj)) {
      this._fixedTagObj[parentId] = parentTitle

      this._markUpdates()
      await setOptions({
        [INTERNAL_VALUES.TAG_LIST_FIXED_MAP]: this._fixedTagObj
      })
    }
  }
  async unfixTag(parentId) {
    if (!this.isOn) {
      return
    }

    delete this._fixedTagObj[parentId]

    this._markUpdates()
    await setOptions({
      [INTERNAL_VALUES.TAG_LIST_FIXED_MAP]: this._fixedTagObj
    })
  }
}

const tagList = new TagList()

const logUST = makeLogFunction({ module: 'url-settings.js' })

function extendsSettings(oSettings) {
  let mSettings = typeof oSettings == 'string'
    ? HOST_URL_SETTINGS[oSettings]
    : oSettings

  const { searchParamList, ...rest } = mSettings
  const mSearchParamList = searchParamList || []
  const importantSearchParamList = mSearchParamList
    .filter((searchParmName) => typeof searchParmName == 'string')
    .filter(Boolean)

  const removeSearchParamList = mSearchParamList
    .filter((searchParm) => isNotEmptyArray(searchParm))
    .map((searchParm) => searchParm[0])
    .filter(Boolean)

  return {
    ...rest,
    removeSearchParamList,
    importantSearchParamList,
    isAlias: typeof oSettings == 'string',
  }
}

function mergeSettings(oSettings, oDefaultSettings) {
  const getUniq = (ar1, ar2) => Array.from(new Set(ar1.concat(ar2)))

  const {
    removeSearchParamList,
    importantSearchParamList,
    ...rest
  } = oSettings
  const {
    removeSearchParamList: defaultRemoveSearchParamList,
    importantSearchParamList: defaultImportantSearchParamList,
    ...defaultRest
  } = oDefaultSettings

  return {
    ...defaultRest,
    ...rest,
    removeSearchParamList: getUniq(removeSearchParamList, defaultRemoveSearchParamList),
    importantSearchParamList: getUniq(importantSearchParamList, defaultImportantSearchParamList),
  }
}

const DEFAULT_HOST_SETTINGS_EXT = extendsSettings(DEFAULT_HOST_SETTINGS)

const HOST_URL_SETTINGS_LIST = Object.entries(HOST_URL_SETTINGS)
  .map(([hostname, oSettings]) => [
    hostname,
    mergeSettings(extendsSettings(oSettings), DEFAULT_HOST_SETTINGS_EXT)
  ])

const HOST_URL_SETTINGS_MAP = new Map(HOST_URL_SETTINGS_LIST)

const getHostSettings = (url) => {
  logUST('getHostSettings 00', url)

  let oUrl
  try {
    oUrl = new URL(url);
    // eslint-disable-next-line no-unused-vars
  } catch (notUrlErr) {
    return DEFAULT_HOST_SETTINGS_EXT
  }

  const { hostname } = oUrl;
  logUST('getHostSettings 11', hostname)

  let targetHostSettings = HOST_URL_SETTINGS_MAP.get(hostname)
  logUST('targetHostSettings 22 hostname', targetHostSettings)

  if (!targetHostSettings) {
    const [firstPart, ...restPart] = hostname.split('.')
    logUST('targetHostSettings 33', firstPart, restPart.join('.'))

    if (firstPart == 'www') {
      targetHostSettings = HOST_URL_SETTINGS_MAP.get(restPart.join('.'))
      logUST('targetHostSettings 44', targetHostSettings)
    } else {
      targetHostSettings = HOST_URL_SETTINGS_MAP.get(`www.${hostname}`)
      logUST('targetHostSettings 55', targetHostSettings)
    }
  }

  if (!targetHostSettings) {
    const baseDomain = hostname.split('.').slice(-2).join('.')

    targetHostSettings = HOST_URL_SETTINGS_MAP.get(baseDomain)
    logUST('targetHostSettings 66 baseDomain', baseDomain, targetHostSettings)
  }

  return targetHostSettings || DEFAULT_HOST_SETTINGS_EXT
}

const HOST_URL_SETTINGS_LIST_SHORT = Object.entries(HOST_URL_SETTINGS_SHORT)
  .map(([hostname, oSettings]) => [
    hostname,
    extendsSettings(oSettings)
  ])

const HOST_LIST_FOR_PAGE_OPTIONS = HOST_URL_SETTINGS_LIST_SHORT
  .toSorted((a, b) => a[0].localeCompare(b[0]))
  .filter(([, obj]) => (isNotEmptyArray(obj.removeSearchParamList) || isNotEmptyArray(obj.removeAllSearchParamForPath)) && !obj.isAlias)
    .map(
      ([hostname, obj]) => `${hostname}{${(obj.removeAllSearchParamForPath || []).toSorted().join(',')}}`
    )
const logUP = makeLogFunction({ module: 'url-partial.js' })

function removeIndexFromPathname(pathname) {
  let list = pathname.split(/(\/)/)
  const last = list.at(-1)

  if (last.startsWith('index.') || last === 'index') {
    list = list.slice(0, -1)
  }

  return list.join('')
}

function removeLastSlashFromPathname(pathname) {
  return pathname.length > 1 && pathname.endsWith('/')
    ? pathname.slice(0, -1)
    : pathname
}

const getPathnameForSearch = (pathname) => {
  let mPathname = pathname

  // no index in pathname
  mPathname = removeIndexFromPathname(mPathname)
  mPathname = removeLastSlashFromPathname(mPathname)

  return mPathname
}

const pathToList = (pathname) => {
  let list = pathname.split(/(\/)/).filter(Boolean)

  if (1 < list.length && list.at(-1) === '/') {
    list = list.slice(0, -1)
  }

  return list
}
const isPathPartMathToPatternPart = ({ patternPart, pathPart }) => {
  let result

  if (patternPart.startsWith(':@')) {
    result = pathPart && pathPart.startsWith('@')
  } else if (patternPart.startsWith(':')) {
    result = pathPart && pathPart != '/'
  } else {
    result = pathPart === patternPart
  }
  logUP('isPathPartMathToPatternPart () 11', patternPart, pathPart, result)

  return result
}

const getPathnamePart = ({ pathname, pattern }) => {
  const patternAsList = pathToList(pattern)
  const pathAsList = pathToList(pathname)
  const resultPartList = []

  let isOk = patternAsList.length <= pathAsList.length

  let i = 0
  while (isOk && i < patternAsList.length) {
    isOk = isPathPartMathToPatternPart({ patternPart: patternAsList[i], pathPart: pathAsList[i] })
    if (isOk) {
      resultPartList.push(pathAsList[i])
    }
    i = i + 1
  }

  let resultPathname = isOk
    ? resultPartList.join('')
    : undefined

  return resultPathname
}
const logUIS = makeLogFunction({ module: 'url-is.js' })

function makeIsSearchParamItemMatch(patternList) {
  logUIS('makeIsSearchParamItemMatch () 00', patternList)
  const isFnList = []

  patternList.forEach((pattern) => {
    logUIS('makeIsSearchParamItemMatch () 11', 'pattern', pattern)
    const asteriskIndex = pattern.indexOf('*')
    const partsLength = pattern.split('*').length
    switch (true) {
      case asteriskIndex < 0: {
        const equalIndex = pattern.indexOf('=')
        const fullPattern = pattern

        if (0 < equalIndex) {
          const [paramName, paramValue] = pattern.split('=')
          isFnList.push(({ key, value }) => key == paramName && value == paramValue)
          logUIS('makeIsSearchParamItemMatch () 11', '({k,v}) => k == k1 && v == v1', fullPattern)
        } else {
          isFnList.push(({ key }) => key == fullPattern)
          logUIS('makeIsSearchParamItemMatch () 11', '(s) => s == fullPattern', fullPattern)
        }

        break
      }
      case asteriskIndex == 0 && partsLength == 2: {
        if (pattern.length == 1) {
          isFnList.push(() => true)
          logUIS('makeIsSearchParamItemMatch () 11', '() => true', pattern)
        } else {
          const end = pattern.slice(asteriskIndex + 1)
          // isFnList.push((s) => s.endsWith(end) && end.length < s.length)
          isFnList.push(({ key }) => key.endsWith(end))
          logUIS('makeIsSearchParamItemMatch () 11', '(s) => s.endsWith(end)', end)
        }
        break
      }
      case 0 < asteriskIndex && partsLength == 2: {
        const start = pattern.slice(0, asteriskIndex)
        if (asteriskIndex == pattern.length - 1) {
          isFnList.push(({ key }) => key.startsWith(start))
          logUIS('makeIsSearchParamItemMatch () 11', '(s) => s.startsWith(start)', start)
        } else {
          const end = pattern.slice(asteriskIndex + 1)
          const minLength = start.length + end.length
          isFnList.push(({ key }) => key.startsWith(start) && key.endsWith(end) && minLength <= key.length)
          logUIS('makeIsSearchParamItemMatch () 11', '(s) => s.startsWith(start) && s.endsWith(end) && minLength <= s.length', start, end)
        }
      }
    }
  })

  logUIS('makeIsSearchParamItemMatch () 99', 'isFnList.length', isFnList.length)
  return ({ key, value }) => isFnList.some((isFn) => isFn({ key, value }))
}

const isPathnameMatchForPatternExactly = (pathname, pattern) => {
  logUIS('isPathnameMatchForPatternExactly () 00', pathname)
  logUIS('isPathnameMatchForPatternExactly () 00', pattern)

  if (pattern === '*') {
    return true
  }

  const pathAsList = pathToList(pathname)
  logUIS('isPathnameMatchForPatternExactly () 11 pathAsList', pathAsList)

  const patternAsList = pathToList(pattern)
  logUIS('isPathnameMatchForPatternExactly () 11 patternAsList', patternAsList)

  const isMath = 0 < patternAsList.length && pathAsList.length === patternAsList.length
    && patternAsList.every((patternPart, patternIndex) => isPathPartMathToPatternPart({ patternPart, pathPart: pathAsList[patternIndex] })
  )

  return isMath
}

function isSearchParamsMatchForPattern({ searchParams, searchParamsPattern }) {
  if (!searchParamsPattern) {
    return true
  }

  const keyList = searchParamsPattern
    .split('&')
    .map((keyValue) => keyValue.split('=')[0])

  return keyList
    .every((key) => searchParams.get(key) !== undefined)
}

function isUrlMathPathnameAndSearchParams({ url, pattern }) {
  if (!pattern) {
    return false
  }

  const oUrl = new URL(url);
  const { pathname, searchParams } = oUrl;

  const [pathPattern, searchParamsPattern] = pattern.split('?')

  if (pathPattern) {
    if (!isPathnameMatchForPatternExactly(pathname, pathPattern)) {
      return false
    }
  }

  if (searchParamsPattern) {
    if (!isSearchParamsMatchForPattern({ searchParams, searchParamsPattern })) {
      return false
    }
  }

  return true
}
const logUS = makeLogFunction({ module: 'url-search.js' })

function isHostnameMatchForSearch(hostname, requiredHostname) {
  return hostname === requiredHostname
}

function isSearchParamListMatchForPartialSearch(searchParams, requiredSearchParams) {
  if (!requiredSearchParams) {
    return true
  }

  return Object.entries(requiredSearchParams)
    .every(([key, value]) => searchParams.get(key) === value)
}

// ?TODO /posts == /posts?page=1 OR clean on open /posts?page=1 TO /posts IF page EQ 1
async function startPartialUrlSearch({ url, pathnamePattern }) {
  logUS('startPartialUrlSearch () 00', url)

  try {
    const targetHostSettings = getHostSettings(url)
    logUS('startPartialUrlSearch 11 targetHostSettings', !!targetHostSettings, targetHostSettings)

    // if (!targetHostSettings) {
    //   return {
    //     isSearchAvailable: false,
    //   }
    // }

    const oUrl = new URL(url);

    let requiredSearchParams
    if (targetHostSettings) {
      const { importantSearchParamList } = targetHostSettings

      if (isNotEmptyArray(importantSearchParamList)) {
        const isSearchParamItemMatch = makeIsSearchParamItemMatch(importantSearchParamList)
        const oSearchParams = oUrl.searchParams;
        logUS('startPartialUrlSearch 22', 'oSearchParams', oSearchParams)

        const matchedParamList = []
        for (const [key, value] of oSearchParams) {
          logUS('startPartialUrlSearch 22', 'for (const [searchParam] of oSearchParams', key)
          if (isSearchParamItemMatch({ key, value })) {
            matchedParamList.push(key)
          }
        }

        requiredSearchParams = {}
        matchedParamList.forEach((searchParam) => {
          requiredSearchParams[searchParam] = oSearchParams.get(searchParam)
        })
      }
    }

    if (!targetHostSettings?.isHashRequired) {
      oUrl.hash = ''
    }


    let newPathname
    let isPathnameMatchForSearch

    if (pathnamePattern) {
      newPathname = getPathnamePart({
        pathname: oUrl.pathname,
        pattern: pathnamePattern,
      })

      isPathnameMatchForSearch = (pathname, requiredPathname) => {
        const normalizedPathname = getPathnamePart({ pathname, pattern: pathnamePattern })

        return normalizedPathname === requiredPathname
      }

    } else {
      newPathname = getPathnameForSearch(oUrl.pathname)

      isPathnameMatchForSearch = (pathname, requiredPathname) => {
        const normalizedPathname = getPathnameForSearch(pathname)

        return normalizedPathname === requiredPathname
      }
    }

    oUrl.pathname = newPathname
    oUrl.search = ''
    const urlForSearch = oUrl.toString();
    const {
      hostname: requiredHostname,
      pathname: requiredPathname,
    } = new URL(urlForSearch);

    logUS('startPartialUrlSearch 99', 'requiredSearchParams', requiredSearchParams)

    return {
      isSearchAvailable: true,
      urlForSearch,
      isUrlMatchToPartialUrlSearch: (testUrl) => {
        const oUrl = new URL(testUrl)

        return isHostnameMatchForSearch(oUrl.hostname, requiredHostname)
          && isPathnameMatchForSearch(oUrl.pathname, requiredPathname)
          && isSearchParamListMatchForPartialSearch(oUrl.searchParams, requiredSearchParams)
      }
    }
    // eslint-disable-next-line no-unused-vars
  } catch (_e) {
    return {
      isSearchAvailable: false,
    }
  }
}
const logCUA = makeLogFunction({ module: 'clear-url.js' })

const removeQueryParamsIfTarget = (url) => {
  if (!url) {
    return url
  }

  logCUA('removeQueryParamsIfTarget () 00', url)
  let cleanUrl = url

  try {
    const targetHostSettings = getHostSettings(url)
    logCUA('removeQueryParamsIfTarget () 11 targetHostSettings', targetHostSettings)

    if (targetHostSettings) {
      const { removeAllSearchParamForPath, removeSearchParamList } = targetHostSettings
      logCUA('removeQueryParamsIfTarget () 22 removeSearchParamList', removeSearchParamList)

      const oUrl = new URL(url);
      const { pathname, searchParams: oSearchParams } = oUrl;

      if (isNotEmptyArray(removeSearchParamList)) {
        logCUA('removeQueryParamsIfTarget () 33 isNotEmptyArray(removeSearchParamList)')

        const isSearchParamItemMatch = makeIsSearchParamItemMatch(removeSearchParamList)

        const matchedParamList = []
        for (const [key, value] of oSearchParams) {
          if (isSearchParamItemMatch({ key, value })) {
            matchedParamList.push(key)
          }
        }
        // remove query params by list
        const isHasThisSearchParams = 0 < matchedParamList.length

        if (isHasThisSearchParams) {
          matchedParamList.forEach((searchParam) => {
            oSearchParams.delete(searchParam)
          })
          oUrl.search = oSearchParams.size > 0
            ? `?${oSearchParams.toString()}`
            : ''
        }
      }

      if (isNotEmptyArray(removeAllSearchParamForPath)) {
        const isMath = removeAllSearchParamForPath.some((pathPattern) => isPathnameMatchForPatternExactly(pathname, pathPattern))
        if (isMath) {
          // remove all search params
          oUrl.search = ''
        }
      }

      cleanUrl = oUrl.toString();
    }

  // eslint-disable-next-line no-unused-vars
  } catch (_e)
  // eslint-disable-next-line no-empty
  {

  }

  logCUA('removeQueryParamsIfTarget () 99 cleanUrl', cleanUrl)

  return cleanUrl
}

function removeHashAndSearchParams(url) {
  // logCUA('removeHashAndSearchParams () 00', url)
  try {
    const oUrl = new URL(url);
    oUrl.search = ''
    oUrl.hash = ''

    return oUrl.toString();
  // eslint-disable-next-line no-unused-vars
  } catch (e) {
    return url
  }
}
function getAuthorUrlFromPostUrl(url) {
  const oUrl = new URL(url)
  let pathPartList = oUrl.pathname.split(/(\/)/).filter(Boolean)
  let iEnd = -1

  if (pathPartList.at(iEnd) == '/') {
    iEnd -= 1
  }
  if (pathPartList.at(iEnd)) {
    iEnd -= 1
  }
  if (pathPartList.at(iEnd) == '/') {
    iEnd -= 1
  }

  oUrl.pathname = pathPartList.slice(0, iEnd + 1).join('')

  return oUrl.toString()
}

function getMatchedGetAuthor(url) {
  // logUAU('getMatchedGetAuthor () 00', url)
  const targetHostSettings = getHostSettings(url)

  if (!targetHostSettings?.getAuthor) {
    return
  }

  const getAuthorList = Array.isArray(targetHostSettings.getAuthor)
    ? targetHostSettings.getAuthor
    : [targetHostSettings.getAuthor]

  let matchedGetAuthor
  let iWhile = 0
  while (!matchedGetAuthor && iWhile < getAuthorList.length) {
    const { pagePattern } = getAuthorList[iWhile]

    if (isUrlMathPathnameAndSearchParams({ url, pattern: pagePattern })) {
      matchedGetAuthor = getAuthorList[iWhile]
    }

    iWhile += 1
  }

  return matchedGetAuthor
}
const supportedProtocols = ["https:", "http:"];

function isSupportedProtocol(urlString) {
  try {
    const url = new URL(urlString);

    return supportedProtocols.includes(url.protocol);
  // eslint-disable-next-line no-unused-vars
  } catch (_er) {
    return false;
  }
}

const isYoutube = (hostname) => hostname.endsWith('youtube.com')

function isYouTubeChannelPathWithoutSubdir(pathname) {
  const [part1, part2, part3] = pathname.split('/').filter(Boolean)
  let result = false

  if (!part1) {
    return false
  }

  switch (true) {
    case part1.startsWith('@'):
      result = !part2
      break
    case part1 == 'c':
    case part1 == 'channel':
    case part1 == 'user':
      result = !part3
      break
    // case part1 == 'watch':
    // case !part1:
    //   result = false
  }

  return result
}

const isYouTubeChannelWithoutSubdir = (url) => {
  const oUrl = new URL(url)

  return isYoutube(oUrl.hostname) && isYouTubeChannelPathWithoutSubdir(oUrl.pathname)
}

// ignore create from api to detect create from user
class IgnoreBkmControllerApiActionSet {
  constructor() {
    this._innerSet = new Set();
  }
  addIgnoreCreate({ parentId, url, title }) {
    const innerKey = url
      ? `create#${parentId}#${url}`
      : `create#${parentId}#${title}`

    this._innerSet.add(innerKey)
  }
  hasIgnoreCreate({ parentId, url, title }) {
    const innerKey = url
      ? `create#${parentId}#${url}`
      : `create#${parentId}#${title}`

    const isHas = this._innerSet.has(innerKey)
    if (isHas) {
      this._innerSet.delete(innerKey)
    }

    return isHas
  }

  makeAddIgnoreAction(action) {
    return function (bkmId) {
      const innerKey = `${action}#${bkmId}`
      this._innerSet.add(innerKey)
    }
  }
  makeHasIgnoreAction(action) {
    return function (bkmId) {
      const innerKey = `${action}#${bkmId}`

      const isHas = this._innerSet.has(innerKey)
      if (isHas) {
        this._innerSet.delete(innerKey)
      }

      return isHas
    }
  }

  addIgnoreMove = this.makeAddIgnoreAction('move')
  hasIgnoreMove = this.makeHasIgnoreAction('move')

  // addIgnoreRemove = this.makeAddIgnoreAction('remove')
  // hasIgnoreRemove = this.makeHasIgnoreAction('remove')

  addIgnoreUpdate = this.makeAddIgnoreAction('update')
  hasIgnoreUpdate = this.makeHasIgnoreAction('update')
}

const ignoreBkmControllerApiActionSet = new IgnoreBkmControllerApiActionSet()
const logFI = makeLogFunction({ module: 'folder-ignore.js' })

async function createFolderIgnoreInController({
  title,
  parentId,
  index,
}) {
  const options = { parentId, title }
  if (index != undefined) {
    options.index = index
  }

  ignoreBkmControllerApiActionSet.addIgnoreCreate(options)

  return await browser.bookmarks.create(options)
}

async function moveNodeIgnoreInController({ id, parentId, index }) {
  const options = {}
  if (parentId != undefined) {
    options.parentId = parentId
  }
  if (index != undefined) {
    options.index = index
  }
  if (Object.keys(options).length == 0) {
    return
  }

  ignoreBkmControllerApiActionSet.addIgnoreMove(id)

  return await browser.bookmarks.move(id, options)
}

async function moveFolderIgnoreInController({ id, parentId, index }) {
  logFI('moveFolderIgnoreInController 00')
  return await moveNodeIgnoreInController({ id, parentId, index })
}

// eslint-disable-next-line no-unused-vars
async function moveFolderContentToEnd(fromFolderId, toFolderId) {
  const nodeList = await browser.bookmarks.getChildren(fromFolderId)

  await nodeList.reduce(
    (promiseChain, node) => promiseChain.then(
      () => moveNodeIgnoreInController({ id: node.id, parentId: toFolderId })
    ),
    Promise.resolve(),
  );
}

async function moveFolderContentToStart(fromFolderId, toFolderId) {
  const nodeList = await browser.bookmarks.getChildren(fromFolderId)
  const reversedNodeList = nodeList.toReversed()

  await reversedNodeList.reduce(
    (promiseChain, node) => promiseChain.then(
      () => moveNodeIgnoreInController({ id: node.id, parentId: toFolderId, index: 0 })
    ),
    Promise.resolve(),
  );
}

async function updateFolderIgnoreInController({ id, title }) {
  ignoreBkmControllerApiActionSet.addIgnoreUpdate(id)
  await browser.bookmarks.update(id, { title })
}

async function updateFolder({ id, title }) {
  await browser.bookmarks.update(id, { title })
}

async function removeFolder(bkmId) {
  await browser.bookmarks.remove(bkmId)
}
async function moveFolderAfterRename({ id, parentId, title, index }) {
  const moveArgs = {}
  const settings = await extensionSettings.get()

  if (settings[USER_OPTION.USE_FLAT_FOLDER_STRUCTURE]) {
    const correctParentId = getNewFolderRootId(title)

    if (parentId != correctParentId) {
      moveArgs.parentId = correctParentId
    }
  }

  const finalParentId = moveArgs.parentId || parentId

  if (finalParentId in BUILTIN_BROWSER_ROOT_FOLDER_MAP) {
    const firstLevelNodeList = await browser.bookmarks.getChildren(finalParentId)
    const findIndex = firstLevelNodeList.find((item) => title.localeCompare(item.title) < 0)

    if (index != findIndex) {
      moveArgs.index = findIndex.index
    }
  }

  if (0 < Object.keys(moveArgs).length) {
    moveFolderIgnoreInController({
      id,
      ...moveArgs,
    })
  }
}
const logFCR = makeLogFunction({ module: 'folder-create.js' })

async function _findOrCreateFolder(title) {
  const {
    onlyTitle: newOnlyTitle,
    objDirectives: objNewDirectives,
  } = getTitleDetails(title)
  let folder = await findFolder(newOnlyTitle)

  if (!folder) {
    const parentId = getNewFolderRootId(title)
    const firstLevelNodeList = await browser.bookmarks.getChildren(parentId)
    const findIndex = firstLevelNodeList.find((node) => title.localeCompare(node.title) < 0)
    logFCR('findOrCreateFolder 11 findIndex', findIndex?.index, findIndex?.title)

    const folderParams = {
      parentId,
      title,
    }

    if (findIndex) {
      folderParams.index = findIndex.index
    }

    folder = await createFolderIgnoreInController(folderParams)
  } else {
    const {
      onlyTitle: oldOnlyTitle,
      objDirectives: objOldDirectives,
    } = getTitleDetails(folder.title)

    const oldBigLetterN = oldOnlyTitle.replace(/[^A-Z]+/g, "").length
    const newBigLetterN = newOnlyTitle.replace(/[^A-Z]+/g, "").length
    // const isAbbreviation = title.length == newBigLetterN
    logFCR('findOrCreateFolder () 22', oldBigLetterN, newBigLetterN)

    const oldDashN = oldOnlyTitle.replace(/[^-]+/g,"").length
    const newDashN = newOnlyTitle.replace(/[^-]+/g,"").length

    const isUseNewTitle = oldBigLetterN < newBigLetterN || newDashN < oldDashN
    const hasChangesInDirectives = isChangesInDirectives({ oldDirectives: objOldDirectives, newDirectives: objNewDirectives })

    let actualOnlyTitle = isUseNewTitle ? newOnlyTitle : oldOnlyTitle

    if (isUseNewTitle || hasChangesInDirectives) {
      const objSumDirectives = Object.assign({}, objOldDirectives, objNewDirectives)
      const newTitle = getTitleWithDirectives({ onlyTitle: actualOnlyTitle, objDirectives: objSumDirectives })

      await updateFolder({ id: folder.id, title: newTitle })
      await moveFolderAfterRename({
        id: folder.id,
        title: newTitle,
        parentId: folder.parentId,
        index: folder.index,
      })
    }
  }

  return folder.id
}

// folderTitle = 'DONE @D' 'selected @D' 'BEST @D'
async function _findOrCreateDatedFolder({ templateTitle, parentId }) {
  if (!isDatedFolderTemplate(templateTitle)) {
    return
  }
  logFCR('_findOrCreateDatedFolder () 00', templateTitle)

  const datedTitle = getDatedTitle(templateTitle)
  logFCR('_findOrCreateDatedFolder () 11', 'datedTitle', datedTitle)
  let foundFolder = await findSubFolderWithExactTitle({ title: datedTitle, parentId })

  if (!foundFolder) {
    const firstLevelNodeList = await browser.bookmarks.getChildren(parentId)
    const compareDatedTitleWithFixed = makeCompareDatedTitleWithFixed(datedTitle)
    const findIndex = firstLevelNodeList.find((node) => !node.url && compareDatedTitleWithFixed(node.title) < 0)

    const folderParams = {
      parentId,
      title: datedTitle,
    }

    if (findIndex) {
      folderParams.index = findIndex.index
    }

    foundFolder = await createFolderIgnoreInController(folderParams)
  }

  return foundFolder.id
}

async function _findFolder(title) {
  // const folder = await findFolder(title)
  const folder = await findSubFolderWithExactTitle({ title, parentId: OTHER_BOOKMARKS_FOLDER_ID })

  if (folder) {
    return folder.id
  }
}
const logDT = makeLogFunction({ module: 'folderCreator.js' })

class FolderCreator {
  // title to id
  cacheTitleToId = {}
  mapIdToTitle = {}
  mapPromise = {}

  clearCache(folderId) {
    const title = this.mapIdToTitle[folderId]

    if (title) {
      delete this.mapIdToTitle[folderId]
      delete this.mapPromise[title]
      delete this.cacheTitleToId[title]
    }
  }

  async _useCacheForCreate({ getKey, getValue, options }) {
    const key = getKey(options)
    logDT('_useCacheForCreate() 00 key', key)

    let id = this.cacheTitleToId[key]
    if (id) {
      delete this.mapPromise[key]
      return id;
    }

    const promise = this.mapPromise[key]

    if (!promise) {
      this.mapPromise[key] = getValue(options)
      id = await this.mapPromise[key]
    } else {
      id = await promise
    }

    this.cacheTitleToId[key] = id
    this.mapIdToTitle[id] = key

    return id
  }
  async findOrCreateFolder(templateTitle) {
    logDT('findOrCreateFolder() 00', templateTitle)

    const id = await this._useCacheForCreate({
      getKey: (options) => options,
      getValue: _findOrCreateFolder,
      options: templateTitle,
    })

    return id
  }
  async findOrCreateDatedFolderId({ templateTitle, templateId }) {
    logDT('findOrCreateDatedFolderWithCache() 00', templateTitle, templateId)

    const parentId = await this.findOrCreateDatedRootNew()

    const id = await this._useCacheForCreate({
      getKey: (options) => getDatedTitle(options.templateTitle),
      getValue: (options) => _findOrCreateDatedFolder({ ...options, parentId }),
      options: { templateTitle, templateId },
    })

    return id
  }

  async _useCacheForFind({ getKey, getValue, options }) {
    const key = getKey(options)
    logDT('_useCacheForFind() 00 key', key)

    let id = this.cacheTitleToId[key]
    if (id || id === null) {
      delete this.mapPromise[key]
      return id;
    }

    const promise = this.mapPromise[key]

    if (!promise) {
      this.mapPromise[key] = getValue(options)
      id = await this.mapPromise[key]
    } else {
      id = await promise
    }

    this.cacheTitleToId[key] = id || null

    if (id) {
      this.mapIdToTitle[id] = key
    }

    return id
  }
  async _findFolder(title) {
    logDT('findFolder() 00', title)

    const id = await this._useCacheForFind({
      getKey: (options) => options,
      getValue: _findFolder,
      options: title,
    })

    return id
  }

  async findOrCreateDatedRootNew() {
    const id = await this.findOrCreateFolder(DATED_ROOT_NEW)
    return id
  }
  async findDatedRootNew() {
    const id = await this._findFolder(DATED_ROOT_NEW)
    return id
  }

  async findOrCreateDatedRootOld() {
    const id = await this.findOrCreateFolder(DATED_ROOT_OLD)
    return id
  }
  async findDatedRootOld() {
    const id = await this._findFolder(DATED_ROOT_OLD)
    return id
  }

  async findOrCreateUnclassified() {
    const id = await this.findOrCreateFolder(UNCLASSIFIED_TITLE)
    return id
  }
  async findUnclassified() {
    const id = await this._findFolder(UNCLASSIFIED_TITLE)
    return id
  }
}

const folderCreator = new FolderCreator()
const logBI = makeLogFunction({ module: 'bookmark-ignore.js' })

async function createBookmarkIgnoreInController({
  title,
  url,
  parentId,
  index,
}) {
  logBI('createBookmarkIgnoreInController 00', url)
  const options = { url, parentId, title }
  if (index != undefined) {
    options.index = index
  }

  ignoreBkmControllerApiActionSet.addIgnoreCreate(options)

  await browser.bookmarks.create(options)
  logBI('createBookmarkIgnoreInController 99')
}

async function moveBookmarkIgnoreInController({ id, parentId, index }) {
  const options = {}
  if (parentId != undefined) {
    options.parentId = parentId
  }
  if (index != undefined) {
    options.index = index
  }
  if (Object.keys(options).length == 0) {
    return
  }

  ignoreBkmControllerApiActionSet.addIgnoreMove(id)

  await browser.bookmarks.move(id, options)
}

async function updateBookmarkIgnoreInController({ id, title, url }) {
  const options = {}
  if (title != undefined) {
    options.title = title
  }
  if (url != undefined) {
    options.url = url
  }
  if (Object.keys(options).length == 0) {
    return
  }

  ignoreBkmControllerApiActionSet.addIgnoreUpdate(id)

  await browser.bookmarks.update(id, options)
}

async function removeBookmark(bkmId) {
  try {
    await browser.bookmarks.remove(bkmId)
  // eslint-disable-next-line no-unused-vars
  } catch (er)
  // eslint-disable-next-line no-empty
  {
  }
}
async function getDatedBookmarkList({ url, template }) {
  const bookmarkListWithParent = await getBookmarkListWithParent({ url })

  const selectedList = bookmarkListWithParent
    .filter(({ parentTitle }) => isDatedTitleForTemplate({ title: parentTitle, template }))

  return selectedList
}

async function removePreviousDatedBookmarks({ url, template }) {
  const bookmarkList = await getDatedBookmarkList({ url, template })

  const removeFolderList = bookmarkList
    .toSorted((a,b) => compareDatedTitle(a.parentTitle, b.parentTitle))
    .slice(1)

  if (removeFolderList.length == 0) {
    return
  }

  await Promise.all(
    removeFolderList.map(
      ({ id }) => removeBookmark(id)
    )
  )
}

async function removeDatedBookmarksForTemplate({ url, template }) {
  const removeFolderList = await getDatedBookmarkList({ url, template })

  await Promise.all(
    removeFolderList.map(
      ({ id }) => removeBookmark(id)
    )
  )
}
function makeIsTitleMatchForEvents(patternList) {
  const isFnList = []

  patternList
    .filter(Boolean)
    .map((pattern) => pattern.toLowerCase())
    .forEach((pattern) => {
      const asteriskIndex = pattern.indexOf('*')

      if (asteriskIndex == pattern.length - 1 && 0 < asteriskIndex) {
        const start = pattern.slice(0, -1)
        isFnList.push((title) => title.startsWith(start))
      } else {
        isFnList.push((title) => title == pattern)
      }
    })

  return (title) => {
    const titleLow = title.toLowerCase()

    return isFnList.some((isFn) => isFn(titleLow))
  }
}

function isTitleMatchForEvents({ title, pattern }) {
  let result = false
  const titleLow = title.toLowerCase()
  const patternLow = pattern.toLowerCase()

  const asteriskIndex = patternLow.indexOf('*')

  if (asteriskIndex == patternLow.length - 1 && 0 < asteriskIndex) {
    const start = patternLow.slice(0, -1)
    result = titleLow.startsWith(start)
  } else {
    result = (titleLow == patternLow)
  }

  return result
}

class UrlEvents {
  constructor () {
    this.isOnClearUrl = false

    this.isOnCreateBookmark = false
    this.deleteListOnCreate = []

    this.isOnVisit = false
    this.deleteListOnVisit = []
  }

  useSettings({ userSettings }) {
    this.isOnClearUrl = userSettings[USER_OPTION.CLEAR_URL_ON_PAGE_OPEN],

    this.isOnCreateBookmark = userSettings[USER_OPTION.DELETE_BOOKMARK_ON_CREATING]
    this.deleteListOnCreate = userSettings[USER_OPTION.DELETE_BOOKMARK_ON_CREATING_LIST]

    this.isOnVisit = userSettings[USER_OPTION.DELETE_BOOKMARK_ON_VISITING]
    this.deleteListOnVisit = userSettings[USER_OPTION.DELETE_BOOKMARK_ON_VISITING_LIST]
  }

  async onPageReady({ tabId, url }) {
    this.onVisitUrl({ url })

    if (!this.isOnClearUrl) {
      return
    }

    const cleanUrl = removeQueryParamsIfTarget(url);

    if (url !== cleanUrl) {
      await page.changeUrlInTab({ tabId, url: cleanUrl })
    }
  }

  async _removeBookmarksByPatterns({ url, patternList }) {
    // console.log('_removeBookmarksByPatterns() 00 ')
    // console.log(url)
    // console.log('patternList ', patternList)
    if (patternList.length == 0) {
      return
    }

    if (url.startsWith('chrome:') || url.startsWith('about:')) {
      return
    }

    const cleanUrl = removeQueryParamsIfTarget(url);
    const bookmarkListWithParent = await getBookmarkListWithParent({ url: cleanUrl })
    const deleteList = []

    const isTitleMatch = makeIsTitleMatchForEvents(patternList)

    bookmarkListWithParent.forEach(({ id, parentTitle }) => {
      const normalizedParentTitle = getTitleForPattern(parentTitle)

      if (isTitleMatch(normalizedParentTitle)) {
        deleteList.push(id)
      }
    })

    // console.log('deleteList ', deleteList)

    await deleteList.reduce(
      (promiseChain, bkmId) => promiseChain.then(
        () => removeBookmark(bkmId)
      ),
      Promise.resolve(),
    );
  }

  async onVisitUrl({ url }) {
    if (!this.isOnVisit) {
      return
    }

    await this._removeBookmarksByPatterns({ url, patternList: this.deleteListOnVisit })
  }

  async onCreateBookmark({ url, parentTitle }) {
    // console.log('onCreateBookmark() 00')
    // console.log(url)
    // console.log('parentTitle ', parentTitle)
    if (!this.isOnCreateBookmark) {
      return
    }

    if (this.deleteListOnCreate.length == 0) {
      return
    }

    const createDeleteTemplateList = []

    this.deleteListOnCreate
      .filter(Boolean)
      .map((template) => {
        const parts = template.split('->')

        if (parts.length == 2) {
          createDeleteTemplateList.push({
            createTemplate: parts[0].trim(),
            deleteTemplate: parts[1].trim(),
          })
        }
      })

    const normalizedParentTitle = getTitleForPattern(parentTitle)

    const deleteTemplateList = createDeleteTemplateList
      .filter(({ createTemplate }) => isTitleMatchForEvents({ title: normalizedParentTitle, pattern: createTemplate }))
      .map(({ deleteTemplate }) => deleteTemplate)

    // console.log('deleteTemplateList ', deleteTemplateList)

    await this._removeBookmarksByPatterns({ url, patternList: deleteTemplateList })
  }
}

const urlEvents = new UrlEvents()
// import {
//   makeLogFunction,
// } from '../api-low/index.js'

// const logCBK = makeLogFunction({ module: 'bookmark-create.js' })


let lastCreatedBkmParentId
let lastCreatedBkmUrl

function isBookmarkCreatedWithApi({ parentId, url }) {
  return parentId == lastCreatedBkmParentId && url == lastCreatedBkmUrl
}

async function createBookmarkWithApi({
  parentId,
  url,
  title,
}) {
  // logCBK('createBookmarkWithApi() 00', parentId, url)
  lastCreatedBkmParentId = parentId
  lastCreatedBkmUrl = url

  const bookmarkList = await browser.bookmarks.search({ url })
  const deleteList = bookmarkList.filter((bkm) => bkm.parentId == parentId)

  await createBookmarkIgnoreInController({
    parentId,
    index: 0,
    url,
    title,
  })

  await deleteList.reduce(
    (promiseChain, bkm) => promiseChain.then(
      () => removeBookmark(bkm.id)
    ),
    Promise.resolve(),
  );
}

async function createBookmarkWithParentId({ parentId, url, title }) {
  // logCBK('createBookmarkWithParentId() 00', parentId, url)
  const [parentNode] = await browser.bookmarks.get(parentId)
  const parentTitle = parentNode.title

  const isDatedTemplate = isDatedFolderTemplate(parentTitle)

  if (isDatedTemplate) {
    // logCBK('createBookmarkWithParentId() 11 before get findOrCreateDatedFolderId')
    const datedFolderId = await folderCreator.findOrCreateDatedFolderId({ templateTitle: parentTitle, templateId: parentId })
    // logCBK('createBookmarkWithParentId() 22 datedFolderId', datedFolderId)
    await createBookmarkWithApi({ parentId: datedFolderId, url, title })
    await removePreviousDatedBookmarks({ url, template: parentTitle })

    if (!isVisitedDatedTemplate(parentTitle)) {
      await tagList.addTag({ parentId, parentTitle })
    }
  } else {
    await createBookmarkWithApi({ parentId, url, title })
    await tagList.addTag({ parentId, parentTitle })
  }

  urlEvents.onCreateBookmark({ url, parentTitle })
}

async function afterUserCreatedBookmarkInGUI({ parentId, id, url, index }) {
  const [parentNode] = await browser.bookmarks.get(parentId)
  const parentTitle = parentNode.title

  const isDatedTemplate = isDatedFolderTemplate(parentTitle)

  if (isDatedTemplate) {
    const datedFolderId = await folderCreator.findOrCreateDatedFolderId({ templateTitle: parentTitle, templateId: parentId })
    await moveBookmarkIgnoreInController({
      id,
      parentId: datedFolderId,
      index: 0,
    })

    await removePreviousDatedBookmarks({ url, template: parentTitle })

    if (!isVisitedDatedTemplate(parentTitle)) {
      await tagList.addTag({ parentId, parentTitle })
    }
  } else {
    if (index !== 0) {
      await moveBookmarkIgnoreInController({ id, index: 0 })
    }

    await tagList.addTag({ parentId, parentTitle })
  }

  urlEvents.onCreateBookmark({ url, parentTitle })
}

async function createBookmark({ parentId, parentTitle, url, title }) {

  if (parentId) {
    await createBookmarkWithParentId({ parentId, url, title })
  } else if (parentTitle) {
    const parentId = await folderCreator.findOrCreateFolder(parentTitle)

    await createBookmarkWithParentId({
      parentId,
      url,
      title,
    })
  } else {
    throw new Error('createBookmark() must use parentId or parentTitle')
  }
}
async function createBookmarkOpened({ url, title }) {
  const list = await getDatedBookmarkList({ url, template: DATED_TEMPLATE_VISITED })

  if (0 < list.length) {
    return
  }

  await createBookmark({ url, title, parentTitle: DATED_TEMPLATE_OPENED })
}

async function createBookmarkVisited({ url, title }) {
  await createBookmark({ url, title, parentTitle: DATED_TEMPLATE_VISITED })

  // visited replaces opened
  await removeDatedBookmarksForTemplate({ url, template: DATED_TEMPLATE_OPENED })
}
const NODE_ACTION = {
  CREATE: `CREATE`,
  MOVE: `MOVE`,
  CHANGE: `CHANGE`,
  DELETE: `DELETE`,
};

class NodeTaskQueue {
  queue = []
  nRunningTask = 0
  concurrencyLimit = 1
  runTask

  constructor(fnRunTask) {
    this.runTask = fnRunTask
  }

  async _run() {
    if (this.nRunningTask >= this.concurrencyLimit || this.queue.length === 0) {
      return;
    }

    this.nRunningTask++;
    const task = this.queue.shift();
    if (task) {
      await this.runTask(task);
    }
    this.nRunningTask--;

    this._run();
  }

  enqueue(task) {
    this.queue.push(task);
    this._run();
  }
  enqueueCreate(task) {
    this.enqueue({ ...task, action: NODE_ACTION.CREATE });
  }
  enqueueMove(task) {
    this.enqueue({ ...task, action: NODE_ACTION.MOVE });
  }
  enqueueChange(task) {
    this.enqueue({ ...task, action: NODE_ACTION.CHANGE });
  }
  enqueueDelete(task) {
    this.enqueue({ ...task, action: NODE_ACTION.DELETE });
  }
}
const logVU = makeLogFunction({ module: 'visited-urls.js' })

const URL_MARK_OPTIONS = {
  OPENED: 'OPENED',
  VISITED: 'VISITED',
}

class VisitedUrls {
  constructor () {
    this.isOn = false

    this.cacheVisitedUrls = new CacheWithLimit({ name: 'cacheVisitedUrls', size: 500 });
    this.cacheTabId = new CacheWithLimit({ name: 'cacheVisitedTabIds', size: 500 });
  }

  useSettings({ isOn }) {
    logVU("useSettings", { isOn })
    this.isOn = isOn

    if (!this.isOn) {
      this.cacheVisitedUrls.clear()
      this.cacheTabId.clear()
    }
  }

  async _markUrl({ url, title, mark }) {
    if (!this.isOn) {
      return
    }

    if (!url) {
      return
    }

    if (url.startsWith('chrome:') || url.startsWith('about:')) {
      return
    }

    switch (mark) {
      case URL_MARK_OPTIONS.VISITED: {
        logVU("**** _markUrl 11 VISITED", url)
        await createBookmarkVisited({ url, title })
        break
      }
      case URL_MARK_OPTIONS.OPENED: {
        logVU("**** _markUrl 11 OPENED", url)
        await createBookmarkOpened({ url, title })
        break
      }
    }
  }

  _onReplaceUrlInActiveTab({
    tabId,
    oldUrl: inOldUrl,
    oldTitle,
    newUrl: inNewUrl,
    newTitle,
  }) {
    const oldUrl = removeQueryParamsIfTarget(inOldUrl);
    const newUrl = removeQueryParamsIfTarget(inNewUrl);
    logVU("_onReplaceUrlInTab 11/1", tabId, oldUrl)
    logVU("_onReplaceUrlInTab 11/2", tabId, newUrl)

    if (oldUrl == newUrl) {
      return
    }

    // mark oldUrl as visited
    // const title = this.cacheVisitedUrls.get(oldUrl)
    // logVU("_onReplaceUrlInTab 22", 'title', title)

    // logVU("_onReplaceUrlInTab 22 oldTitle", oldTitle)
    if (oldUrl && oldTitle) {
      // logVU("_onReplaceUrlInTab 222")
      this._markUrl({ url: oldUrl, title: oldTitle, mark: URL_MARK_OPTIONS.VISITED })
    }

    // mark newUrl as activated
    if (newUrl) {
      // logVU("_onReplaceUrlInTab 33 newTitle", newTitle)
      this.cacheVisitedUrls.add(newUrl, newTitle)
    }
  }

  _debouncedReplaceUrl = debounce(this._onReplaceUrlInActiveTab.bind(this), 40)

  updateTab(tabId, changeInfo, isActiveTab) {
    logVU("_onUpdateTab 00", tabId, changeInfo)

    let beforeData = this.cacheTabId.get(tabId)
    const updateObj = {}

    // if (changeInfo?.status == 'loading' && changeInfo?.url) {
    if (changeInfo?.status && changeInfo?.url) {
      if (changeInfo.url !== beforeData?.url) {
        updateObj.time = Date.now()

        if (beforeData) {
          updateObj.before = {
            url: beforeData.url,
            title: beforeData.title,
          }

          delete beforeData.before
        }

        beforeData = undefined
      }
    }

    if (changeInfo?.status == 'complete') {
      updateObj.isComplete = true
    }

    if (changeInfo?.url) {
      updateObj.url = changeInfo?.url
    }

    if (changeInfo?.title) {
      updateObj.title = changeInfo?.title
    }

    if (Object.keys(updateObj).length == 0) {
      return
    }

    const afterData = {
      ...beforeData,
      ...updateObj,
    }
    logVU("_onUpdateTab 55", tabId, afterData)

    this.cacheTabId.add(tabId, afterData)

    if (updateObj.title) {
      const { url } = afterData

      if (url) {
        if (this.cacheVisitedUrls.has(url)) {
          this.cacheVisitedUrls.add(url, updateObj.title)
        }
      }
    }

    if (isActiveTab && afterData.url && afterData.title != undefined && afterData.isComplete) {
      this._debouncedReplaceUrl({
        tabId,
        oldUrl: afterData?.before?.url,
        oldTitle: afterData?.before?.title,
        newUrl: afterData.url,
        newTitle: afterData.title,
      })
    }
  }

  visitTab(tabId, url, title) {
    if (!url) {
      return
    }

    if (url.startsWith('chrome:') || url.startsWith('about:')) {
      return
    }

    logVU("visitTab 00-", url, "-", title, "-")
    const cleanedUrl = removeQueryParamsIfTarget(url);

    this.cacheVisitedUrls.add(cleanedUrl, title)
    // this.cacheTabId.add(tabId, { url: cleanedUrl, title })
  }

  async closeTab(tabId) {
    logVU("closeTab 11", tabId)
    const cachedTabData = this.cacheTabId.get(tabId)
    logVU("closeTab 22 cachedTabData", cachedTabData)

    if (!cachedTabData) {
      return
    }
    const { url, title: cachedTitle } = cachedTabData
    logVU("closeTab 33", url)
    const title = cachedTitle || url

    if (this.cacheVisitedUrls.has(url)) {
      logVU("closeTab 44", title)
      this._markUrl({ url, title, mark: URL_MARK_OPTIONS.VISITED })
    } else {
      logVU("closeTab 55", title)
      this._markUrl({ url, title, mark: URL_MARK_OPTIONS.OPENED })
    }

    this.cacheTabId.delete(tabId)
    logVU("closeTab 99", tabId)
  }
}

const visitedUrls = new VisitedUrls()
const logIX = makeLogFunction({ module: 'init-extension' })

async function createContextMenu(settings) {
  await browser.menus.removeAll();

  browser.menus.create({
    id: CONTEXT_MENU_CMD_ID.ADD_BOOKMARK_FROM_SELECTION_MENU,
    contexts: BROWSER_SPECIFIC.MENU_CONTEXT,
    title: 'add bookmark, selection as a tag',
  });
  browser.menus.create({
    id: CONTEXT_MENU_CMD_ID.ADD_BOOKMARK_FROM_INPUT_MENU,
    contexts: BROWSER_SPECIFIC.MENU_CONTEXT,
    title: 'add bookmark, tag from input',
  });
  browser.menus.create({
    id: CONTEXT_MENU_CMD_ID.CLEAR_URL,
    contexts: BROWSER_SPECIFIC.MENU_CONTEXT,
    title: 'clear url from hash and all search params',
  });
  browser.menus.create({
    id: CONTEXT_MENU_CMD_ID.GET_URL_FROM_URL,
    contexts: BROWSER_SPECIFIC.MENU_CONTEXT,
    title: 'get url from url',
  });
  browser.menus.create({
    id: CONTEXT_MENU_CMD_ID.CLOSE_DUPLICATE,
    contexts: BROWSER_SPECIFIC.MENU_CONTEXT,
    title: 'close duplicate tabs',
  });
  browser.menus.create({
    id: CONTEXT_MENU_CMD_ID.CLOSE_BOOKMARKED,
    contexts: BROWSER_SPECIFIC.MENU_CONTEXT,
    title: 'close bookmarked tabs',
  });

  if (settings[USER_OPTION.YOUTUBE_HIDE_PAGE_HEADER]) {
    browser.menus.create({
      id: CONTEXT_MENU_CMD_ID.TOGGLE_YOUTUBE_HEADER,
      contexts: BROWSER_SPECIFIC.MENU_CONTEXT,
      title: 'toggle youtube page header',
    });
  }
}

async function setFirstActiveTab({ debugCaller='' }) {
  logIX(`setFirstActiveTab() 00 <- ${debugCaller}`, memo['activeTabId'])

  const tabs = await browser.tabs.query({ active: true, lastFocusedWindow: true });
  const [Tab] = tabs;

  if (Tab?.id) {
    memo.activeTabId = Tab.id;
    memo.activeTabUrl = Tab.url

    logIX(`setFirstActiveTab() 11 <- ${debugCaller}`, memo['activeTabId'])
  }
}

async function initFromUserOptions() {
  await extensionSettings.restoreFromStorage()
  const userSettings = await extensionSettings.get()

  await Promise.all([
    createContextMenu(userSettings),
    tagList.useSettings({
      isOn: userSettings[USER_OPTION.USE_TAG_LIST],
      userSettings,
    }),
    visitedUrls.useSettings({
      isOn: userSettings[USER_OPTION.MARK_CLOSED_PAGE_AS_VISITED],
    }),
    urlEvents.useSettings({
      userSettings,
    }),
  ])
}

async function initExtension({ debugCaller='' }) {
  const isInitRequired = !browserStartTime.isActual() || !extensionSettings.isActual() || !memo.activeTabId
  if (isInitRequired) {
    logIX(`initExtension() 00 <- ${debugCaller}`)
  }

  await Promise.all([
    !browserStartTime.isActual() && browserStartTime.init(),
    !extensionSettings.isActual() && initFromUserOptions(),
    !memo.activeTabId && setFirstActiveTab({ debugCaller: `initExtension() <- ${debugCaller}` }),
  ])

  if (isInitRequired) {
    logIX('initExtension() end')
  }
}
const logGB = makeLogFunction({ module: 'get-bookmarks.api.js' })

const getParentIdList = (bookmarkList = []) => {
  const parentIdList = bookmarkList
    .map((bookmarkItem) => bookmarkItem.parentId)
    .filter(Boolean)

  return Array.from(new Set(parentIdList))
}

const getFullPath = (id, bkmFolderById) => {
  const path = [];

  let currentId = id;
  while (currentId) {
    const folder = bkmFolderById.get(currentId);

    if (folder) {
      path.push(folder.title);
    }

    currentId = folder?.parentId;
  }

  return path.filter(Boolean).toReversed()
}

async function addBookmarkParentInfo({ bookmarkList, folderByIdMap, isFullPath = true }) {
  // parentIdList.length <= bookmarkList.length
  // for root folders parentIdList=[]
  const parentIdList = getParentIdList(bookmarkList)

  if (parentIdList.length === 0) {
    return
  }

  const knownParentIdList = [];
  const unknownParentIdList = [];

  parentIdList.forEach((id) => {
    if (folderByIdMap.has(id)) {
      knownParentIdList.push(id)
    } else {
      unknownParentIdList.push(id)
    }
  })

  const knownFolderList = knownParentIdList.map((id) => folderByIdMap.get(id))

  if (unknownParentIdList.length > 0) {
    const unknownFolderList = await getBookmarkListDirty(unknownParentIdList)

    unknownFolderList.forEach((folder) => {
      folderByIdMap.add(
        folder.id,
        {
          title: folder.title,
          parentId: folder.parentId,
        }
      )
      knownFolderList.push(folder)
    })
  }

  if (isFullPath) {
    return await addBookmarkParentInfo({
      bookmarkList: knownFolderList,
      folderByIdMap,
      isFullPath,
    })
  }
}

async function getBookmarkInfo({ url, isShowTitle, isShowUrl }) {
  logGB('getBookmarkInfo () 00', url)
  const bookmarkList = await browser.bookmarks.search({ url });
  logGB('getBookmarkInfo () 11 search({ url })', bookmarkList.length, bookmarkList)

  await addBookmarkParentInfo({
    bookmarkList,
    folderByIdMap: memo.bkmFolderById,
    isFullPath: true,
  })

  logGB('getBookmarkInfo () 99 bookmarkList', bookmarkList.length, bookmarkList)
  return bookmarkList
    .map((bookmarkItem) => {
      const fullPathList = getFullPath(bookmarkItem.parentId, memo.bkmFolderById)

      return {
        id: bookmarkItem.id,
        ...(isShowUrl ? { url: bookmarkItem.url } : {}),
        ...(isShowTitle ? { title: bookmarkItem.title } : {}),
        parentId: bookmarkItem.parentId,
        parentTitle: fullPathList.at(-1),
        path: fullPathList.slice(0, -1).concat('').join('/ '),
        source: bookmarkItem.source,
      }
    });
}

async function getBookmarkInfoUni({ url, useCache=false, isShowTitle, isShowUrl }) {
  if (!url || !isSupportedProtocol(url)) {
    return;
  }

  let bookmarkList;
  let source;

  if (useCache) {
    bookmarkList = memo.cacheUrlToInfo.get(url);

    if (bookmarkList) {
      source = SOURCE.CACHE;
      logGB('getBookmarkInfoUni OPTIMIZATION: from cache bookmarkInfo')
    }
  }

  if (!bookmarkList) {
    bookmarkList = await getBookmarkInfo({ url, isShowTitle, isShowUrl });
    source = SOURCE.ACTUAL;
    memo.cacheUrlToInfo.add(url, bookmarkList);
  }

  return {
    bookmarkList,
    source,
  };
}

async function getPartialBookmarkList({ url, exactBkmIdList = [], pathnamePattern }) {
  // 1 < pathname.length : it is not root path
  //    for https://www.youtube.com/watch?v=qqqqq other conditions than 1 < pathname.length
  // urlForSearch !== url : original url has search params, ending /, index[.xxxx]
  //  original url can be normalized yet, but I want get url with search params, ending /, index[.xxxx]

  const {
    isSearchAvailable,
    urlForSearch,
    isUrlMatchToPartialUrlSearch,
  } = await startPartialUrlSearch({ url, pathnamePattern })
  logGB('getPartialBookmarkList () 22 startPartialUrlSearch', { isSearchAvailable, urlForSearch })

  if (!isSearchAvailable) {
    return []
  }

  const bkmListForSubstring = await browser.bookmarks.search(urlForSearch);
  logGB('getPartialBookmarkList () 33 search(normalizedUrl)', bkmListForSubstring.length, bkmListForSubstring)

  const yetSet = new Set(exactBkmIdList)
  const partialBookmarkList = []
  bkmListForSubstring.forEach((bkm) => {
    if (bkm.url && isUrlMatchToPartialUrlSearch(bkm.url) && !yetSet.has(bkm.id)) {
      partialBookmarkList.push(bkm)
    }
  })

  await addBookmarkParentInfo({
    bookmarkList: partialBookmarkList,
    folderByIdMap: memo.bkmFolderById,
    isFullPath: false,
  })

  return partialBookmarkList
    .map((bookmarkItem) => {
      const folder = memo.bkmFolderById.get(bookmarkItem.parentId);

      return {
        id: bookmarkItem.id,
        url: bookmarkItem.url,
        parentId: bookmarkItem.parentId,
        parentTitle: folder?.title,
      }
    });
}
const logHA = makeLogFunction({ module: 'history.api' })

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
  const visitList = (await browser.history.getVisits({ url }))
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
  const isPartialSearchEnabled = settings[USER_OPTION.USE_PARTIAL_URL_SEARCH]

  let historyItemList

  if (isPartialSearchEnabled) {
    const {
      urlForSearch,
      isUrlMatchToPartialUrlSearch,
    } = await startPartialUrlSearch({ url })

    historyItemList = (await browser.history.search({
      text: urlForSearch,
      maxResults: 10,
    }))
      .filter(
        (i) => i.url && isUrlMatchToPartialUrlSearch(i.url)
      )
  } else {
    historyItemList = (await browser.history.search({
      text: url,
      maxResults: 10,
    }))
      .filter((i) => i.url && i.url.startsWith(url))
  }

  return getVisitListForUrlList(historyItemList.map(i => i.url))
}

async function getHistoryInfo({ url }) {
  logHA('getHistoryInfo () 00', url)
  const allVisitList = await getPreviousVisitList(url);
  logHA('getHistoryInfo () 11 allVisitList', allVisitList)
  const groupedList = allVisitList.flatMap((value, index, array) => index === 0 || array[index - 1] - value  > 60000 ? [value]: [])
  logHA('getHistoryInfo () 22 groupedList', groupedList)
  const filteredList = filterTimeList(groupedList)
  logHA('getHistoryInfo () 33 filteredList', filteredList)

  const visitString = filteredList
    .toReversed()
    .map((i) => formatPrevVisit(i))
    .flatMap((value, index, array) => index === 0 || value !== array[index - 1] ? [value]: [])
    .join(", ")

  logHA('getHistoryInfo () 44 visitString', visitString)

  return {
    visitString
  };
}
const logSHA = makeLogFunction({ module: 'showAuthorBookmarks.js' })

async function showAuthorBookmarksStep2({ tabId, url, authorUrl }) {
  logSHA('showAuthorBookmarksStep2 () 00', tabId, authorUrl, url)
  let authorBookmarkList = []

  if (authorUrl) {
    let cleanedAuthorUrl = removeHashAndSearchParams(authorUrl);
    const matchedGetAuthor = getMatchedGetAuthor(url)

    authorBookmarkList = await getPartialBookmarkList({
      url: cleanedAuthorUrl,
      pathnamePattern: matchedGetAuthor?.authorPattern,
    })
  }

  const filteredList = authorBookmarkList.filter(({ parentTitle }) => !isVisitedDatedTitle(parentTitle))

  const data = {
    authorBookmarkList: filteredList,
  }
  logSHA('showAuthorBookmarksStep2 () 99 sendMessage', tabId, data);
  await page.updateBookmarkInfoInPage({ tabId, data })
}

async function showAuthorBookmarks({ tabId, url }) {
  const matchedGetAuthor = getMatchedGetAuthor(url)
  logSHA('showAuthorBookmarks () 00', tabId, url, matchedGetAuthor)

  switch (true) {
    case !!matchedGetAuthor?.authorSelector: {
      await page.sendMeAuthor({
        tabId,
        authorSelector: matchedGetAuthor.authorSelector,
      })
      break
    }
    case !!matchedGetAuthor: {
      showAuthorBookmarksStep2({
        tabId,
        url,
        authorUrl: getAuthorUrlFromPostUrl(url),
      })
      break
    }
    default:
      showAuthorBookmarksStep2({ tabId })
  }
}
const logUTB = makeLogFunction({ module: 'updateTab.js' })

async function showVisits({ tabId, url }) {
  const visitInfo = await getHistoryInfo({ url })

  const data = {
    visitString: visitInfo.visitString,
  }
  logUTB('showVisits () 99 sendMessage', tabId, data);
  await page.updateBookmarkInfoInPage({ tabId, data })
}

async function showPartialBookmarks({ tabId, url, exactBkmIdList }) {
  const bookmarkList = await getPartialBookmarkList({ url, exactBkmIdList })
  const filteredList = bookmarkList.filter(({ parentTitle }) => !isVisitedDatedTitle(parentTitle))

  const data = {
    partialBookmarkList: filteredList,
  }
  logUTB('showPartialBookmarks () 99 sendMessage', tabId, data);
  await page.updateBookmarkInfoInPage({ tabId, data })
}

async function showExtra({ tabId, url, settings, exactBkmIdList }) {
  const isShowVisits = settings[USER_OPTION.SHOW_PREVIOUS_VISIT]
  const isShowPartialBookmarks = settings[USER_OPTION.USE_PARTIAL_URL_SEARCH]
  const isShowAuthorBookmarks = settings[USER_OPTION.URL_SHOW_AUTHOR_TAGS]

  await Promise.all([
    isShowVisits && showVisits({ tabId, url }),
    isShowPartialBookmarks && showPartialBookmarks({ tabId, url, exactBkmIdList }),
    isShowAuthorBookmarks && showAuthorBookmarks({ tabId, url }),
  ])
}

async function bookmarkListToTagList(bookmarkList) {
  const resultList = []
  const templateTitleList = []

  bookmarkList.forEach(({ parentId, parentTitle }) => {
    if (isDatedFolderTitle(parentTitle)) {
      if (!isVisitedDatedTitle(parentTitle)) {
        const templateTitle = getDatedTemplate(parentTitle)
        templateTitleList.push(templateTitle)
      }
    } else {
      resultList.push({ parentId, parentTitle })
    }
  })

  const templateTagList = await Promise.all(templateTitleList.map(
    (templateTitle) => folderCreator.findOrCreateFolder(templateTitle)
      .then((templateId) => ({ parentId: templateId, parentTitle: templateTitle }))
  ))

  return resultList.concat(templateTagList)
}

async function updateTab({ tabId, url, debugCaller, useCache=false }) {
  logUTB(`UPDATE-TAB () 00 <- ${debugCaller}`, tabId);
  logUTB('UPDATE-TAB () 11', url);

  const settings = await extensionSettings.get()
  const isShowTitle = settings[USER_OPTION.SHOW_BOOKMARK_TITLE]
  const bookmarkInfo = await getBookmarkInfoUni({ url, useCache, isShowTitle })

  let bookmarkList = bookmarkInfo.bookmarkList
  if (settings[USER_OPTION.SHOW_VISITED] === SHOW_VISITED_OPTIONS.IF_NO_OTHER) {
    bookmarkList = bookmarkList.filter(({ parentTitle }) => !isVisitedDatedTitle(parentTitle))

    if (bookmarkList.length == 0) {
      bookmarkList = bookmarkInfo.bookmarkList
    }
  }

  const tagFromBookmarkList = await bookmarkListToTagList(bookmarkInfo.bookmarkList)
  const tagListList = tagList.getListWithBookmarks(tagFromBookmarkList)
  // logUTB('updateTab() tagListList', tagListList.length,'tagList.nAvailableRows', tagList.nAvailableRows)
  // logUTB(tagListList)

  const data = {
    bookmarkList,
    fontSize: settings[USER_OPTION.FONT_SIZE],
    isShowTitle: settings[USER_OPTION.SHOW_BOOKMARK_TITLE],

    isTagListAvailable: tagList.isOn,
    tagList: tagListList,
    tagListOpenMode: settings[USER_OPTION.TAG_LIST_OPEN_MODE],
    isTagListOpenGlobal: tagList.isOpenGlobal,
    tagLength: settings[USER_OPTION.TAG_LIST_TAG_LENGTH],
    nTagListAvailableRows: tagList.nAvailableRows,
    nFixedTags: tagList.nFixedTags,

    isHideSemanticHtmlTagsOnPrinting: settings[USER_OPTION.HIDE_TAG_HEADER_ON_PRINTING],
    isHideHeaderForYoutube: settings[USER_OPTION.YOUTUBE_HIDE_PAGE_HEADER],
  }
  logUTB('UPDATE-TAB () 99 sendMessage', tabId, data);
  await page.updateBookmarkInfoInPage({ tabId, data })
  await showExtra({
    tabId,
    url,
    settings,
    exactBkmIdList: bookmarkInfo.bookmarkList.map(({ id }) => id)
  })
}

async function updateTabTask(options) {
  let tabId = options?.tabId
  let url = options?.url

  if (!tabId) {
    try {
      const tabs = await browser.tabs.query({ active: true, lastFocusedWindow: true });
      const [activeTab] = tabs;

      if (activeTab) {
        tabId = activeTab?.id
        url = activeTab?.url
      }
    // eslint-disable-next-line no-unused-vars
    } catch (_er) {
      return
    }
  }

  if (!url && tabId) {
    try {
      const Tab = await browser.tabs.get(tabId);
      url = Tab?.url
    } catch (er) {
      logUTB('IGNORING. tab was deleted', er);
    }
  }

  if (!(url && isSupportedProtocol(url))) {
    return
  }

  await initExtension({ debugCaller: 'updateTab ()' })

  await updateTab({
    ...options,
    tabId,
    url,
  })
}

const updateActiveTab = debounce_leading3(updateTabTask, 50)

const logBQ = makeLogFunction({ module: 'bookmarkQueue.js' })

let lastCreatedBkmId
let lastCreatedBkmTabId
let lastMovedBkmId


async function onCreateBookmark(task) {
  const { bookmarkId, node } = task
  logBQ('onCreateBookmark () 00', node)

  lastCreatedBkmId = bookmarkId
  lastCreatedBkmTabId = memo.activeTabId

  await afterUserCreatedBookmarkInGUI(node)
}

async function onMoveBookmark(task) {
  const { bookmarkId, node, moveInfo } = task
  const { oldIndex, index, oldParentId, parentId } = moveInfo
  const { url, title } = node

  const isBookmarkWasCreatedManually = (
    bookmarkId == lastCreatedBkmId
    && memo.activeTabId == lastCreatedBkmTabId
    && !isBookmarkCreatedWithApi({ parentId: oldParentId, url: node.url })
  )

  const bookmarkList = await browser.bookmarks.search({ url: node.url });
  const isFirstBookmark = bookmarkList.length == 1
  const isMoveOnly = isBookmarkWasCreatedManually && isFirstBookmark && lastMovedBkmId != bookmarkId

  if (isMoveOnly) {
    await afterUserCreatedBookmarkInGUI(node)
  } else {
    let isReplaceMoveToCreate = false

    if (IS_BROWSER_CHROME) {
      const isChromeBookmarkManagerTabActive = !!memo.activeTabUrl && memo.activeTabUrl.startsWith('chrome://bookmarks');
      isReplaceMoveToCreate = !isChromeBookmarkManagerTabActive
    } else if (IS_BROWSER_FIREFOX) {
      const childrenList = await browser.bookmarks.getChildren(parentId)
      const lastIndex = childrenList.length - 1
        // isReplaceMoveToCreate = index == lastIndex && settings[INTERNAL_VALUES.TAG_LIST_IS_OPEN]
      isReplaceMoveToCreate = index == lastIndex && url == memo.activeTabUrl
    }

    const unclassifiedFolderId = await folderCreator.findUnclassified()
    isReplaceMoveToCreate = isReplaceMoveToCreate && parentId !== unclassifiedFolderId

    if (isReplaceMoveToCreate) {
      await moveBookmarkIgnoreInController({ id: bookmarkId, parentId: oldParentId, index: oldIndex })
      await createBookmark({ parentId, url, title })
    }
  }

  lastMovedBkmId = bookmarkId
}

async function bookmarkQueueRunner(task) {
  let isCallUpdateActiveTab = false

  switch (task.action) {
    case NODE_ACTION.CREATE: {
      await onCreateBookmark(task)
      isCallUpdateActiveTab = true
      break
    }
    case NODE_ACTION.MOVE: {
      const { moveInfo } = task
      const { oldParentId, parentId } = moveInfo

      if (parentId !== oldParentId) {
        await onMoveBookmark(task)
        isCallUpdateActiveTab = true
      }

      break
    }
    case NODE_ACTION.CHANGE: {
      isCallUpdateActiveTab = true
      break
    }
    case NODE_ACTION.DELETE: {
      isCallUpdateActiveTab = true
      break
    }
  }

  if (isCallUpdateActiveTab) {
    updateActiveTab({
      debugCaller: `bookmarks.on ${task.action}`
    });
  }
}

const bookmarkQueue = new NodeTaskQueue(bookmarkQueueRunner)
const logFQ = makeLogFunction({ module: 'folderQueue.js' })

async function onCreateFolder(task) {
  const { node } = task
  logFQ('onCreateFolder () 00', node.title)

  await tagList.addTag({ parentId: node.id, parentTitle: node.title })
  await moveFolderAfterRename(node)
}

async function onMoveFolder(task) {
  const { bookmarkId } = task
  memo.bkmFolderById.delete(bookmarkId);
}

async function onChangeFolder(task) {
  const { bookmarkId, node } = task

  memo.bkmFolderById.delete(bookmarkId);
  await tagList.addTag({ parentId: node.id, parentTitle: node.title })
  // await afterUserCreatedFolderInGUI(node)

  folderCreator.clearCache(bookmarkId)
}

async function onDeleteFolder(task) {
  const { bookmarkId } = task

  memo.bkmFolderById.delete(bookmarkId);
  await tagList.removeTag(bookmarkId)

  folderCreator.clearCache(bookmarkId)
}

async function folderQueueRunner(task) {
  let isCallUpdateActiveTab = false

  switch (task.action) {
    case NODE_ACTION.CREATE: {
      await onCreateFolder(task)
      isCallUpdateActiveTab = true
      break
    }
    case NODE_ACTION.MOVE: {
      await onMoveFolder(task)
      break
    }
    case NODE_ACTION.CHANGE: {
      await onChangeFolder(task)
      isCallUpdateActiveTab = true
      break
    }
    case NODE_ACTION.DELETE: {
      await onDeleteFolder(task)
      isCallUpdateActiveTab = true
      break
    }
  }

  if (isCallUpdateActiveTab) {
    updateActiveTab({
      debugCaller: `bookmarks(folders).on ${task.action}`
    });
  }
}

const folderQueue = new NodeTaskQueue(folderQueueRunner)
// is used in bookmark-list-ops/
// is used in command/addBookmark.js
// is used in controllers/bookmarks.controller.js
async function traverseFolderRecursively({ folder: rootFolder, onFolder, startLevel=0 }) {
  async function traverseFolder({ folder, level }) {
    const childBookmarkList = []
    const childFolderList = []

    if (folder.children) {
      for (const child of folder.children) {
        if (child.url) {
          childBookmarkList.push(child)
        } else {
          childFolderList.push(child)
        }
      }
    }

    await onFolder({
      folder,
      bookmarkList: childBookmarkList,
      folderListLength: childFolderList.length,
      level,
    })

    const nextLevel = level + 1
    await childFolderList.reduce(
      (promiseChain, childFolder) => promiseChain.then(
        () => traverseFolder({ folder: childFolder, level: nextLevel })
      ),
      Promise.resolve(),
    );
  }

  await traverseFolder({ folder: rootFolder, level: startLevel })
}

async function traverseTreeRecursively({ onFolder }) {

  const [rootFolder] = await browser.bookmarks.getTree()
  await traverseFolderRecursively({ folder: rootFolder, onFolder, startLevel: 0 })
}
const logMRG = makeLogFunction({ module: 'mergeFolders.js' })

async function addSubfolders({ parentId, nameSet }) {
  logMRG('addSubfolders 00', parentId)
  if (!parentId) {
    return
  }

  const nodeList = await browser.bookmarks.getChildren(parentId)
  const folderNodeList = nodeList.filter(({ url }) => !url)

  for (const node of folderNodeList) {
    const {
      onlyTitle,
      objDirectives,
    } = getTitleDetails(node.title)
    const normalizedTitle = normalizeTitle(onlyTitle)

    const directiveList = Object.keys(objDirectives)
    const w10 = directiveList.filter((str) => str.startsWith('#')).length
    const w1 = directiveList.filter((str) => !str.startsWith('#')).length

    const nodeData = Object.assign(
      {},
      node,
      {
        onlyTitle,
        objDirectives,
        directiveWeight: w10*10 + w1,
      },
    )

    if (!nameSet[normalizedTitle]) {
      nameSet[normalizedTitle] = [nodeData]
    } else {
      nameSet[normalizedTitle].push(nodeData)
    }
  }
}

async function mergeRootSubFolders() {
  logMRG('mergeRootSubFolders 00')

  const nameSet = {}

  await addSubfolders({ parentId: BOOKMARKS_BAR_FOLDER_ID, nameSet })
  await addSubfolders({ parentId: BOOKMARKS_MENU_FOLDER_ID, nameSet })
  await addSubfolders({ parentId: OTHER_BOOKMARKS_FOLDER_ID, nameSet })

  const moveTaskList = []
  const renameTaskList = []
  const notUniqList = Object.entries(nameSet).filter(([, nodeList]) => nodeList.length > 1)

  for (const [, nodeList] of notUniqList) {
    const sortedList = nodeList.toSorted((a, b) => -(a.directiveWeight - b.directiveWeight) || -a.title.localeCompare(b.title))
    const firstNode = sortedList[0]
    const restNodeList = sortedList.slice(1)
    let objAllDirectives = {}

    for (const fromNode of restNodeList) {
      moveTaskList.push({
        fromNode,
        toNode: firstNode,
      })

      objAllDirectives = Object.assign(objAllDirectives, fromNode.objDirectives)
    }

    objAllDirectives = Object.assign(objAllDirectives, firstNode.objDirectives)

    if (isChangesInDirectives({ oldDirectives: firstNode.objDirectives, newDirectives: objAllDirectives })) {
      const newTitle = getTitleWithDirectives({ onlyTitle: firstNode.onlyTitle, objDirectives: objAllDirectives })

      renameTaskList.push({
        id: firstNode.id,
        title: newTitle,
      })
    }
  }

  logMRG('renameTaskList', renameTaskList)
  logMRG('moveTaskList', moveTaskList)

  await renameTaskList.reduce(
    (promiseChain, { id, title }) => promiseChain.then(
      () => updateFolder({ id,  title })
    ),
    Promise.resolve(),
  );

  await moveTaskList.reduce(
    (promiseChain, { fromNode, toNode }) => promiseChain.then(
      () => moveFolderContentToStart(fromNode.id, toNode.id)
    ),
    Promise.resolve(),
  );

  await moveTaskList.reduce(
    (promiseChain, { fromNode }) => promiseChain.then(
      () => removeFolder(fromNode.id)
    ),
    Promise.resolve(),
  );
}

async function mergeSubFoldersLevelOne(parentId) {
  if (!parentId) {
    return
  }

  // console.log('### mergeSubFolder 00,', parentId)
  const nodeList = await browser.bookmarks.getChildren(parentId)
  const folderNodeList = nodeList.filter(({ url }) => !url)
  const nameSet = {}

  for (const node of folderNodeList) {
    const normalizedTitle = normalizeTitle(node.title)

    if (!nameSet[normalizedTitle]) {
      nameSet[normalizedTitle] = [node]
    } else {
      nameSet[normalizedTitle].push(node)
    }
  }
  // console.log('### mergeSubFolder 11: nameSet', nameSet)

  const notUniqList = Object.entries(nameSet).filter(([, nodeList]) => nodeList.length > 1)
  const moveTaskList = []
  for (const [, nodeList] of notUniqList) {
    const sortedList = nodeList.toSorted((a, b) => -a.title.localeCompare(b.title))
    const firstNode = sortedList[0]
    const restNodeList = nodeList.filter((item) => item.id != firstNode.id)

    for (const fromNode of restNodeList) {
      moveTaskList.push({
        fromNode,
        toNode: firstNode,
      })
    }
  }
  // console.log('### moveTaskList', moveTaskList.map(({ fromNode, toNode }) => `${fromNode.title} -> ${toNode.title}`))

  await moveTaskList.reduce(
    (promiseChain, { fromNode, toNode }) => promiseChain.then(
      () => moveFolderContentToStart(fromNode.id, toNode.id)
    ),
    Promise.resolve(),
  );

  await moveTaskList.reduce(
    (promiseChain, { fromNode }) => promiseChain.then(
      () => removeFolder(fromNode.id)
    ),
    Promise.resolve(),
  );
}

async function mergeFolders() {

  await mergeRootSubFolders()

  const datedRootNewId = await folderCreator.findDatedRootNew()
  const datedRootOldId = await folderCreator.findDatedRootOld()
  await mergeSubFoldersLevelOne(datedRootNewId)
  await mergeSubFoldersLevelOne(datedRootOldId)
}
async function moveNotDescriptiveFolders({ fromId }) {
  if (!fromId) {
    return
  }

  const nodeList = await browser.bookmarks.getChildren(fromId)
  const folderList = nodeList
    .filter(({ url }) => !url)
    .filter(({ title }) => !isDescriptiveFolderTitle(title))

  if (folderList.length == 0) {
    return
  }

  const unclassifiedId = await folderCreator.findOrCreateUnclassified()

  await folderList.reduce(
    (promiseChain, folderNode) => promiseChain.then(
      () => moveFolderContentToStart(folderNode.id, unclassifiedId)
    ),
    Promise.resolve(),
  );

  await folderList.reduce(
    (promiseChain, folderNode) => promiseChain.then(
      () => removeFolder(folderNode.id)
    ),
    Promise.resolve(),
  );
}

async function moveNotDescriptiveFoldersToUnclassified() {

  await moveNotDescriptiveFolders({ fromId: BOOKMARKS_BAR_FOLDER_ID })
  await moveNotDescriptiveFolders({ fromId: OTHER_BOOKMARKS_FOLDER_ID })
}
async function moveRootBookmarks({ fromId }) {
  if (!fromId) {
    return
  }
  // console.log('### moveRootBookmarks 00,', fromId)

  // url.startsWith('place:')
  // Firefox: Bookmark toolbar\'Most visited', Bookmark menu\'Recent tags'
  const nodeList = await browser.bookmarks.getChildren(fromId)
  const bkmList = nodeList
    .filter(({ url }) => url)
    .filter(({ url }) => !url.startsWith('place:'))
  // console.log('### moveRootBookmarks bkmList,', bkmList)

  if (bkmList.length == 0) {
    return
  }

  const unclassifiedId = await folderCreator.findOrCreateUnclassified()

  await bkmList.reduce(
    (promiseChain, bkm) => promiseChain.then(
      () => moveBookmarkIgnoreInController({ id: bkm.id, parentId: unclassifiedId })
    ),
    Promise.resolve(),
  );
}

async function moveRootBookmarksToUnclassified() {

  // await moveRootBookmarks({ fromId: BOOKMARKS_BAR_FOLDER_ID, unclassifiedId })
  // await moveRootBookmarks({ fromId: BOOKMARKS_MENU_FOLDER_ID, unclassifiedId })
  await moveRootBookmarks({ fromId: OTHER_BOOKMARKS_FOLDER_ID })
}
const logMF = makeLogFunction({ module: 'moveFolders.js' })

async function getFolderCorrectParentIdByTitle(title) {
  let parentId = OTHER_BOOKMARKS_FOLDER_ID
  let secondParentId

  if (isTopFolder(title)) {
    parentId = BOOKMARKS_BAR_FOLDER_ID
  }

  if (isDatedFolderTitle(title)) {
    parentId = await folderCreator.findOrCreateDatedRootNew()
    secondParentId = await folderCreator.findDatedRootOld()
  }

  return {
    parentId,
    secondParentId,
  }
}

async function getFolderMovements() {

  const removeList = []
  const moveList = []
  const renameList = []

  async function onFolder({ folder, level, bookmarkList, folderListLength }) {
    logMF('onFolder() 00', folder.title)

    // level 0: ROOT_FOLDER_ID
    // level 1: BOOKMARKS_BAR_FOLDER_ID, BOOKMARKS_MENU_FOLDER_ID, OTHER_BOOKMARKS_FOLDER_ID
    if (level < 2) {
      return
    }

    if (bookmarkList.length == 0 && folderListLength == 0 && isDatedFolderTitle(folder.title)) {
      removeList.push(folder.id)
      return
    }

    // logMF('orderChildren() 11 folder')
    // logMF(folder)
    logMF('onFolder() 11')
    const correct = await getFolderCorrectParentIdByTitle(folder.title)
    logMF('onFolder() 22', correct)

    let correctParentId = correct.parentId
    let isCorrect = folder.parentId == correctParentId
    if (!isCorrect && correct.secondParentId) {
      correctParentId = correct.secondParentId
      isCorrect = folder.parentId == correctParentId
    }
    if (!isCorrect) {
      logMF('onFolder() 33')
      logMF(correct)
      moveList.push({
        id: folder.id,
        parentId: correctParentId,
        level,
      })
    }


    const trimmedTitle = trimTitle(folder.title)

    if (folder.title !== trimmedTitle) {
      renameList.push({
        id: folder.id,
        title: trimmedTitle,
      })
    }
  }

  await traverseTreeRecursively({ onFolder })

  return {
    removeList,
    moveList,
    renameList,
  };
}

async function moveFolders() {
  logMF('moveFolders() 00')

  const {
    removeList,
    moveList,
    renameList,
  } = await getFolderMovements()

  const sortedMoveList = moveList
    .sort((a,b) => -(a.level - b.level))

  logMF('moveFolders() 44')
  logMF(sortedMoveList)

  await removeList.reduce(
    (promiseChain, folderId) => promiseChain.then(
      () => removeFolder(folderId)
    ),
    Promise.resolve(),
  );

  await sortedMoveList.reduce(
    (promiseChain, { id, parentId }) => promiseChain.then(
      () => moveFolderIgnoreInController({ id, parentId })
    ),
    Promise.resolve(),
  );

  await renameList.reduce(
    (promiseChain, { id, title }) => promiseChain.then(
      () => updateFolder({ id,  title })
    ),
    Promise.resolve(),
  );

  logMF('moveFolders() 99')
}
const logMOD = makeLogFunction({ module: 'moveOldDatedFolders.js' })

const KEEP_DATED_FOLDERS = 5

async function moveOldDatedFolders() {
  const fromId = await folderCreator.findDatedRootNew()

  if (!fromId) {
    return
  }

  logMOD('moveOldDatedFolders 00')
  const childrenList = await browser.bookmarks.getChildren(fromId)

  const getDate = (str) => {
    const partList = str.split(' ')
    const strDDMMYYYY = partList.at(-3)

    return strDDMMYYYY.split('-').toReversed().join('')
  }
  const datedFolderList = childrenList
    .filter(({ url, title }) => !url && isDatedFolderTitle(title))
    .map(({ title, id }) => ({
        id,
        title,
        date: getDate(title),
    }))

  const groupedObj = Object.groupBy(datedFolderList, ({ date }) => date)

  const moveList = Object.entries(groupedObj)
    .sort(([dateA],[dateB]) => -dateA.localeCompare(dateB))
    .slice(KEEP_DATED_FOLDERS)
    .map(([,list]) => list)
    .flat()

  if (moveList.length == 0) {
    return
  }

  const toId = await folderCreator.findOrCreateDatedRootOld()

  await moveList.reduce(
    (promiseChain, node) => promiseChain.then(
      () => moveFolderIgnoreInController({ id: node.id, parentId: toId })
    ),
    Promise.resolve(),
  );
}
async function getDoubles() {
  const doubleList = []

  function onFolder({ bookmarkList }) {
    const urlToIdMap = new ExtraMap()

    bookmarkList.forEach(({ url, id, title }) => {
      urlToIdMap.concat(url, { id, title })
    })

    for (const idList of urlToIdMap.values()) {
      if (1 < idList.length) {
        const titleToIdMap = new ExtraMap()

        idList.forEach(({ id, title }) => {
          titleToIdMap.concat(title, id)
        })

        for (const idList2 of titleToIdMap.values()) {
          if (1 < idList2.length) {
            idList2
              .slice(1)
              .forEach(
                (id) => doubleList.push(id)
              )
          }
        }
      }
    }
  }

  await traverseTreeRecursively({ onFolder })

  return doubleList
}

async function removeDoubleBookmarks() {
  const doubleList = await getDoubles()
  // console.log('Double bookmarks:', doubleList.length)

  await doubleList.reduce(
    (promiseChain, bkmId) => promiseChain.then(
      () => removeBookmark(bkmId)
    ),
    Promise.resolve(),
  );

  return {
    nRemovedDoubles: doubleList.length
  }
}
async function getDated() {
  const datedList = []

  function onFolder({ folder, bookmarkList }) {
    if (isDatedFolderTitle(folder.title)) {
      bookmarkList.forEach(({ url, id }) => {
        datedList.push({ id, url, parentTitle: folder.title })
      })
    }
  }

  await traverseTreeRecursively({ onFolder })

  return datedList
}

async function getDoubleDated() {
  const datedList = await getDated()
  const doubleList = []

  const urlToIdMap = new ExtraMap()

  datedList.forEach(({ url, id, parentTitle }) => {
    urlToIdMap.concat(url, { id, parentTitle })
  })

  for (const idList of urlToIdMap.values()) {
    if (1 < idList.length) {
      const datedTemplateToIdMap = new ExtraMap()

      idList.forEach(({ id, parentTitle }) => {
        const datedTemplate = getDatedTemplate(parentTitle)
        datedTemplateToIdMap.concat(datedTemplate, { id, parentTitle })
      })

      for (const idList2 of datedTemplateToIdMap.values()) {
        if (1 < idList2.length) {
          idList2
            .toSorted((a,b) => compareDatedTitle(a.parentTitle, b.parentTitle))
            .slice(1)
            .forEach(
              ({ id }) => doubleList.push(id)
            )
        }
      }
    }
  }

  return doubleList
}

async function removeDoubleDatedBookmarks() {
  const doubleList = await getDoubleDated()

  await doubleList.reduce(
    (promiseChain, bkmId) => promiseChain.then(
      () => removeBookmark(bkmId)
    ),
    Promise.resolve(),
  );
}
async function sortFolders({ parentId, compare=(a,b)=> a.localeCompare(b) }) {
  if (!parentId) {
    return
  }

  // console.log('sortChildFoldersOp',  parentId)
  const nodeList = await browser.bookmarks.getChildren(parentId)

  const sortedNodeList = nodeList
    .filter(({ url }) => !url)
    .toSorted(({ title: a }, { title: b }) => compare(a,b))

  let minMoveIndex = -1

  async function placeFolder({ node, index }) {
    let nodeActual = node

    if (0 <= minMoveIndex && minMoveIndex <= node.index) {
      ([nodeActual] = await browser.bookmarks.get(node.id))
    }

    if (nodeActual.index != index) {
      await moveFolderIgnoreInController({ id: node.id, index })

      if (minMoveIndex == -1) {
        minMoveIndex = index
      }
    }
  }

  await sortedNodeList.reduce(
    (promiseChain, node, index) => promiseChain.then(
      () => placeFolder({ node, index })
    ),
    Promise.resolve(),
  );
}
async function getReplaceList({ originalHostname, newHostname }) {
  const taskList = []

  function onFolder({ bookmarkList }) {

    bookmarkList.forEach(({ url, id }) => {
      try {
        const oUrl = new URL(url)

        if (oUrl.hostname == originalHostname) {
          oUrl.hostname = newHostname

          taskList.push({
            id,
            newUrl: oUrl.toString(),
          })
        }

      // eslint-disable-next-line no-empty
      } finally {

      }
    })
  }

  await traverseTreeRecursively({ onFolder })

  return taskList
}

// eslint-disable-next-line no-unused-vars
async function replaceHostname({ originalHostname, newHostname }) {
  const replaceList = await getReplaceList({ originalHostname, newHostname })

  await replaceList.reduce(
    (promiseChain, { id, newUrl }) => promiseChain.then(
      () => updateBookmarkIgnoreInController({ id, url: newUrl })
    ),
    Promise.resolve(),
  );
}
// import {
//   replaceHostname,
// } from './replaceHostname.js'
const logOD = makeLogFunction({ module: 'orderBookmarks.js' })

async function orderBookmarks() {
  logOD('orderBookmarks() 00')
  // await replaceHostname({ originalHostname: 'hostname1', newHostname: 'hostname2' })

  logOD('orderBookmarks() 11')
  await moveFolders()
  logOD('orderBookmarks() 11.2')
  await moveOldDatedFolders()

  logOD('orderBookmarks() 22')
  await moveRootBookmarksToUnclassified()
  await moveNotDescriptiveFoldersToUnclassified()

  logOD('orderBookmarks() 33')
  await mergeFolders()

  logOD('orderBookmarks() 44')
  await sortFolders({ parentId: BOOKMARKS_BAR_FOLDER_ID })
  await sortFolders({ parentId: BOOKMARKS_MENU_FOLDER_ID })
  await sortFolders({ parentId: OTHER_BOOKMARKS_FOLDER_ID })

  const datedRootNewId = await folderCreator.findDatedRootNew()
  const datedRootOldId = await folderCreator.findDatedRootOld()
  await sortFolders({ parentId: datedRootNewId, compare: compareDatedTitle })
  await sortFolders({ parentId: datedRootOldId, compare: compareDatedTitle })

  logOD('orderBookmarks() 55')
  await removeDoubleBookmarks()
  await removeDoubleDatedBookmarks()

  logOD('orderBookmarks() 99')
}

function isOldDatedFolderTitle(str) {
  const partList = str.split(' ')

  if (!(4 <= partList.length)) {
    return false
  }

  const result = isWeekday(partList.at(-1)) && partList.at(-3).length == 3 && isDate(partList.at(-2)) && !!partList.at(-4)

  return result
}

function fromOldTitleToNewTitle(str) {
  const partList = str.split(' ')

  if (!(4 <= partList.length)) {
    return false
  }

  const weekday = partList.at(-1)
  const date = partList.at(-2)
  const order = partList.at(-3)
  const fixed = partList.slice(0, -3).join(' ')

  return `${fixed} ${date} ${weekday} ${order}`
}

async function migration20250520() {

  const renameList = []

  async function onFolder({ folder, level }) {
    if (level < 2) {
      return
    }

    if (isOldDatedFolderTitle(folder.title)) {
      renameList.push({
        id: folder.id,
        title: fromOldTitleToNewTitle(folder.title),
      })
    }
  }

  await traverseTreeRecursively({ onFolder })

  await renameList.reduce(
    (promiseChain, { id, title }) => promiseChain.then(
      () => updateFolderIgnoreInController({ id,  title })
    ),
    Promise.resolve(),
  );
}
async function migration({ from }) {
  let actualFormat = from

  const v20250520 = 20250520
  if (actualFormat < v20250520) {
    await migration20250520()

    actualFormat = v20250520
    await setOptions({
      [INTERNAL_VALUES.DATA_FORMAT]: actualFormat,
    })
  }
}

async function startAddBookmarkFromSelection() {
  const tabs = await browser.tabs.query({ active: true, lastFocusedWindow: true });
  const [activeTab] = tabs;

  if (activeTab?.id) {
    await page.getSelectionInPage(activeTab.id)
  }
}

async function startAddBookmarkFromInput() {
  const tabs = await browser.tabs.query({ active: true, lastFocusedWindow: true });
  const [activeTab] = tabs;

  if (activeTab?.id) {
    await page.getUserInputInPage(activeTab.id)
  }
}
const logCU = makeLogFunction({ module: 'clearUrlInActiveTab.js' })

async function removeFromUrlHashAndSearchParamsInActiveTab() {
  logCU('removeFromUrlHashAndSearchParamsInActiveTab () 00')
  const tabs = await browser.tabs.query({ active: true, lastFocusedWindow: true });
  const [activeTab] = tabs;

  if (activeTab?.id && activeTab?.url) {
    const cleanUrl = removeHashAndSearchParams(activeTab.url);
    logCU('removeFromUrlHashAndSearchParamsInActiveTab () 22 cleanUrl', cleanUrl)

    if (activeTab.url !== cleanUrl) {
      await page.changeUrlInTab({ tabId: activeTab.id, url: cleanUrl })
    }
  }
}
async function isHasBookmark(url) {
  const bookmarks = await browser.bookmarks.search({ url });

  return bookmarks.length > 0;
}

async function getTabsWithBookmark(tabList) {
  const tabIdAndUrlList = [];

  tabList
    .filter((Tab) => !Tab.pinned)
    .forEach((Tab) => {
      const url = Tab.pendingUrl || Tab.url;

      if (url) {
        tabIdAndUrlList.push({ tabId: Tab.id, url });
      }
    });

  const uniqUrlList = Array.from(new Set(
    tabIdAndUrlList.map(({ url }) => url)
  ));

  // firefox rejects browser.bookmarks.search({ url: 'about:preferences' })
  const urlHasBookmarkList = (
    await Promise.allSettled(uniqUrlList.map(
      (url) => isHasBookmark(url).then((isHasBkm) => isHasBkm && url)
    ))
  )
    .map(({ value }) => value)
    .filter(Boolean);

  const urlWithBookmarkSet = new Set(urlHasBookmarkList);
  const tabWithBookmarkIdList = tabIdAndUrlList
    .filter(({ url }) => urlWithBookmarkSet.has(url))
    .map(({ tabId }) => tabId)

  return {
    tabWithBookmarkIdList,
  }
}

async function closeBookmarkedTabs() {
  const [activeTab] = await browser.tabs.query({ active: true, lastFocusedWindow: true });

  const tabs = await browser.tabs.query({ lastFocusedWindow: true });
  const tabWithIdList = tabs.filter(({ id }) => id);

  const {
    tabWithBookmarkIdList: closeTabIdList,
  } = await getTabsWithBookmark(tabWithIdList);

  const closeTabIdSet = new Set(closeTabIdList)
  let newActiveTabId

  if (activeTab) {
    const activeTabId = activeTab.id;

    if (closeTabIdSet.has(activeTabId)) {

      let leftIndex = activeTabId.index - 1
      while (0 <= leftIndex) {
        const testTab = tabWithIdList[leftIndex]
        if (!closeTabIdSet.has(testTab.id)) {
          newActiveTabId = testTab.id
          break
        }
        leftIndex -= 1
      }

      if (!newActiveTabId) {
        let rightIndex = activeTabId.index + 1
        while (rightIndex < tabWithIdList.length) {
          const testTab = tabWithIdList[rightIndex]
          if (!closeTabIdSet.has(testTab.id)) {
            newActiveTabId = testTab.id
            break
          }
          leftIndex += 1
        }
      }
    }
  }

  if (closeTabIdList.length === tabs.length) {
    // do not close all tabs. It will close window.
    await browser.tabs.create({ index: 0 });
  }

  await Promise.all([
    newActiveTabId && browser.tabs.update(newActiveTabId, { active: true }),
    closeTabIdList.length > 0 && browser.tabs.remove(closeTabIdList),
  ])
}
async function getDuplicatesTabs(inTabList) {
  const tabList = inTabList.toReversed();
  const duplicateTabIdList = [];
  const uniqUrls = new Map();
  let newActiveTabId;

  // do not change pinned tabs
  tabList
    .filter((Tab) => Tab.pinned)
    .forEach((Tab) => {
      const url = Tab.pendingUrl || Tab.url || '';
      uniqUrls.set(url, Tab.id);
    });

  // priority for active tab
  tabList
    .filter((Tab) => !Tab.pinned && Tab.active)
    .forEach((Tab) => {
      const url = Tab.pendingUrl || Tab.url || '';

      if (uniqUrls.has(url)) {
        newActiveTabId = uniqUrls.get(url);
        duplicateTabIdList.push(Tab.id);
      } else {
        uniqUrls.set(url, Tab.id);
      }
    });

  // other tabs
  tabList
    .filter((Tab) => !Tab.pinned && !Tab.active)
    .forEach((Tab) => {
      const url = Tab.pendingUrl || Tab.url || '';

      if (uniqUrls.has(url)) {
        duplicateTabIdList.push(Tab.id);
      } else {
        uniqUrls.set(url, Tab.id);
      }
    });

  return {
    duplicateTabIdList,
    newActiveTabId,
  }
}

async function closeDuplicateTabs() {
  const tabs = await browser.tabs.query({ lastFocusedWindow: true });
  const tabsWithId = tabs.filter(({ id }) => id);
  const {
    duplicateTabIdList,
    newActiveTabId,
  } = await getDuplicatesTabs(tabsWithId);

  await Promise.all([
    newActiveTabId && browser.tabs.update(newActiveTabId, { active: true }),
    duplicateTabIdList.length > 0 && browser.tabs.remove(duplicateTabIdList),
  ])
}
const logUU = makeLogFunction({ module: 'getUrlFromUrl' })

async function getUrlFromUrl() {
  logUU('getUrlFromUrl () 00')

  const tabs = await browser.tabs.query({ active: true, lastFocusedWindow: true });
  const [activeTab] = tabs;

  if (activeTab?.id && activeTab?.url) {
    let testUrl
    let resultUrl
    const oUrl = new URL(activeTab.url)
    logUU('getUrlFromUrl () 11 oUrl', oUrl)
    const { hostname } = oUrl
    const baseDomain = hostname.split('.').slice(-2).join('.')

    try {
      switch (baseDomain) {
        case '9gag.com': {
          testUrl = oUrl.hash.split('#').at(1)

          break
        }
        case 'dev.to': {
          const decoded = decodeURIComponent(oUrl.pathname)
          const i = decoded.indexOf('https://')

          if (-1 < i) {
            testUrl = decoded.slice(i)
          }

          break
        }
      }

      if (testUrl) {
        const o = new URL(testUrl)

        if (o) {
          resultUrl = testUrl
        }
      }

      // eslint-disable-next-line no-unused-vars
    } catch (e)
    // eslint-disable-next-line no-empty
    {

    }

    if (resultUrl) {
      logUU('getUrlFromUrl () 99 call replaceUrlInTab ()')
      await page.replaceUrlInTab({ tabId: activeTab.id, url: resultUrl })
    }
  }
}
async function moveToFlatFolderStructure() {
  const settings = await extensionSettings.get()

  if (!settings[USER_OPTION.USE_FLAT_FOLDER_STRUCTURE]) {
    await extensionSettings.update({
      [USER_OPTION.USE_FLAT_FOLDER_STRUCTURE]: true,
    })
  }

  await orderBookmarks()

  // await replaceHostname()
}
async function toggleYoutubeHeader() {
  const tabs = await browser.tabs.query({ active: true, lastFocusedWindow: true });
  const [activeTab] = tabs;

  if (activeTab?.id) {
    await page.toggleYoutubeHeaderInPage(activeTab.id)
  }
}

const logBCT = makeLogFunction({ module: 'bookmarks.controller.js' })

function onCreated(bookmarkId, node) {
  logBCT('onCreated 00', node)
  if (ignoreBkmControllerApiActionSet.hasIgnoreCreate(node)) {
    return
  }
  logBCT('onCreated 11')

  if (node.url) {
    bookmarkQueue.enqueueCreate({ bookmarkId, node })
  } else {
    folderQueue.enqueueCreate({ bookmarkId, node })
  }
}

async function onMoved(bookmarkId, moveInfo) {
  if (ignoreBkmControllerApiActionSet.hasIgnoreMove(bookmarkId)) {
    return
  }

  const [node] = await browser.bookmarks.get(bookmarkId)
  if (node.url) {
    bookmarkQueue.enqueueMove({ bookmarkId, node, moveInfo })
  } else {
    folderQueue.enqueueMove({ bookmarkId, node, moveInfo })
  }
}

const bookmarksController = {
  onCreated: ignoreBatch(onCreated),
  onMoved: ignoreBatch(onMoved),
  async onChanged(bookmarkId, changeInfo) {
    if (ignoreBkmControllerApiActionSet.hasIgnoreUpdate(bookmarkId)) {
      return
    }

    const [node] = await browser.bookmarks.get(bookmarkId)

    if (node.url) {
      bookmarkQueue.enqueueChange({ bookmarkId, node, changeInfo })
    } else {
      folderQueue.enqueueChange({ bookmarkId, node, changeInfo })
    }
  },
  async onRemoved(bookmarkId, { node }) {
    // if (ignoreBkmControllerApiActionSet.hasIgnoreRemove(bookmarkId)) {
    //   return
    // }

    if (node.url) {
      bookmarkQueue.enqueueDelete({ bookmarkId, node })
    } else {
      folderQueue.enqueueDelete({ bookmarkId, node })
    }
  },
}
const logCC = makeLogFunction({ module: 'commands.controller' })

const commandsController = {
  async onCommand (command) {
    logCC('commandsController.onCommand', command);

    switch (command) {
      case KEYBOARD_CMD_ID.ADD_BOOKMARK_FROM_INPUT_KBD: {
        startAddBookmarkFromInput()
        break;
      }
      case KEYBOARD_CMD_ID.ADD_BOOKMARK_FROM_SELECTION_KBD: {
        startAddBookmarkFromSelection()
        break;
      }
    }
  }
}
const logCMC = makeLogFunction({ module: 'contextMenu.controller' })

const contextMenusController = {
  async onClicked (OnClickData) {
    logCMC('contextMenus.onClicked 00', OnClickData.menuItemId);

    switch (OnClickData.menuItemId) {
      case CONTEXT_MENU_CMD_ID.ADD_BOOKMARK_FROM_INPUT_MENU: {
        startAddBookmarkFromInput()
        break;
      }
      case CONTEXT_MENU_CMD_ID.ADD_BOOKMARK_FROM_SELECTION_MENU: {
        startAddBookmarkFromSelection()
        break;
      }
      case CONTEXT_MENU_CMD_ID.CLOSE_DUPLICATE: {
        closeDuplicateTabs();
        break;
      }
      case CONTEXT_MENU_CMD_ID.CLOSE_BOOKMARKED: {
        closeBookmarkedTabs();
        break;
      }
      case CONTEXT_MENU_CMD_ID.CLEAR_URL: {
        removeFromUrlHashAndSearchParamsInActiveTab()
        break;
      }
      case CONTEXT_MENU_CMD_ID.GET_URL_FROM_URL: {
        logCMC('contextMenus.onClicked 11 CONTEXT_MENU_CMD_ID.GET_URL_FROM_URL')
        getUrlFromUrl();
        break;
      }
      case CONTEXT_MENU_CMD_ID.TOGGLE_YOUTUBE_HEADER: {
        toggleYoutubeHeader()
        break;
      }
    }
  }
}
const logIM = makeLogFunction({ module: 'incoming-message.js' })
const logIMT = makeLogFunction({ module: 'incoming-message.js/TAB_IS_READY' })
// const logIMPE = makeLogFunction({ module: 'incoming-message.js/PAGE_EVENT' })

const HandlersWithUpdateTab = {
  [EXTENSION_MSG_ID.ADD_BOOKMARK_FOLDER_BY_ID]: async ({ parentId, url, title }) => {
    logIM('runtime.onMessage ADD_BOOKMARK_FOLDER_BY_ID');
    await createBookmark({
      parentId,
      title,
      url,
    })
  },
  [EXTENSION_MSG_ID.ADD_BOOKMARK_FOLDER_BY_NAME]: async ({ parentTitleList, url, title }) => {
    logIM('runtime.onMessage ADD_BOOKMARK_FOLDER_BY_NAME', parentTitleList);

    await Promise.allSettled(parentTitleList.map(
      (parentTitle) => createBookmark({
        parentTitle,
        url,
        title,
      })
    ))
  },
  [EXTENSION_MSG_ID.DELETE_BOOKMARK]: async ({ bookmarkId }) => {
    logIM('runtime.onMessage DELETE_BOOKMARK', bookmarkId);
    await removeBookmark(bookmarkId);
  },


  [EXTENSION_MSG_ID.FIX_TAG]: async ({ parentId, parentTitle }) => {
    logIM('runtime.onMessage FIX_TAG');
    await tagList.fixTag({ parentId, parentTitle })
  },
  [EXTENSION_MSG_ID.UNFIX_TAG]: async ({ parentId }) => {
    logIM('runtime.onMessage UNFIX_TAG');
    await tagList.unfixTag(parentId)
  },
  [EXTENSION_MSG_ID.UPDATE_AVAILABLE_ROWS]: async ({ value }) => {
    logIM('runtime.onMessage UPDATE_AVAILABLE_ROWS', value);
    await tagList.updateAvailableRows(value)
  },
}

const OtherHandlers = {
  // [EXTENSION_MSG_ID.PAGE_EVENT]: async (messageObj) => {
  //   logIMPE('runtime.onMessage PAGE_EVENT', messageObj);
  // },
  [EXTENSION_MSG_ID.TAB_IS_READY]: async ({ tabId, url }) => {
    logIMT('runtime.onMessage TAB_IS_READY 00/1', url);
    logIMT('runtime.onMessage TAB_IS_READY 00/2', tabId, memo.activeTabId);
    // IT IS ONLY when new tab load first url
    if (tabId === memo.activeTabId) {
      logIMT('runtime.onMessage TAB_IS_READY 11');

      urlEvents.onPageReady({ tabId, url })

      updateActiveTab({
        tabId,
        debugCaller: `runtime.onMessage TAB_IS_READY`,
      })
    }
  },

  [EXTENSION_MSG_ID.SHOW_TAG_LIST]: async ({ value }) => {
    logIM('runtime.onMessage SHOW_TAG_LIST', value);
    await tagList.openTagList(value)
  },

  [EXTENSION_MSG_ID.OPTIONS_ASKS_DATA]: async () => {
    logIM('runtime.onMessage OPTIONS_ASKS_DATA');

    const settings = await extensionSettings.get();
    browser.runtime.sendMessage({
      command: EXTENSION_MSG_ID.DATA_FOR_OPTIONS,
      HOST_LIST_FOR_PAGE_OPTIONS,
      USER_OPTION,
      settings,
    });
  },
  [EXTENSION_MSG_ID.OPTIONS_ASKS_SAVE]: async ({ updateObj }) => {
    logIM('runtime.onMessage OPTIONS_ASKS_SAVE');
    await extensionSettings.update(updateObj)
  },
  [EXTENSION_MSG_ID.OPTIONS_ASKS_FLAT_BOOKMARKS]: async () => {
    logIM('runtime.onMessage OPTIONS_ASKS_FLAT_BOOKMARKS');

    let success
    try {
      await moveToFlatFolderStructure()
      success = true
    } catch (e) {
      logIM('IGNORE Error on flatting bookmarks', e);
    }

    await browser.runtime.sendMessage({
      command: EXTENSION_MSG_ID.FLAT_BOOKMARKS_RESULT,
      success,
    });
  },

  [EXTENSION_MSG_ID.RESULT_AUTHOR]: async ({ tabId, url, authorUrl }) => {
    logIM('runtime.onMessage RESULT_AUTHOR', authorUrl);
    showAuthorBookmarksStep2({
      tabId,
      url,
      authorUrl,
    })
  },
}

const allHandlers = {
  ...HandlersWithUpdateTab,
  ...OtherHandlers,
}

async function onIncomingMessage (message, sender) {
  const tabId = sender?.tab?.id;
  const { command, ...restMessage } = message
  logIM('onIncomingMessage 00', command);

  // ExtensionMessageHandlers[command]?()
  const handler = allHandlers[command]

  if (handler) {
    logIM('onIncomingMessage 11');
    await handler({ ...restMessage, tabId })
    logIM('onIncomingMessage 22');

    if (HandlersWithUpdateTab[command]) {
      logIM('onIncomingMessage 33');
      updateActiveTab({
        tabId,
        debugCaller: `runtime.onMessage ${command}`,
      })
    }
  }
}
const logRC = makeLogFunction({ module: 'runtime.controller' })

function checkCommandShortcuts() {
  browser.commands.getAll((commands) => {
    let missingShortcuts = [];

    for (let {name, shortcut} of commands) {
      if (shortcut === '') {
        missingShortcuts.push(name);
      }
    }
  });
}

const runtimeController = {
  async onStartup() {
    logRC('runtime.onStartup');

    await initExtension({ debugCaller: 'runtime.onStartup' })
    updateActiveTab({
      debugCaller: 'runtime.onStartup'
    });

    const savedObj = await getOptions([
      INTERNAL_VALUES.DATA_FORMAT,
      USER_OPTION.USE_FLAT_FOLDER_STRUCTURE,
    ]);

    if (savedObj[INTERNAL_VALUES.DATA_FORMAT] !== DATA_FORMAT) {
      await migration({ from: savedObj[INTERNAL_VALUES.DATA_FORMAT] })
    }

    if (savedObj[USER_OPTION.USE_FLAT_FOLDER_STRUCTURE]) {
      await orderBookmarks()
    }

    checkCommandShortcuts()
  },
  async onInstalled () {
    logRC('runtime.onInstalled');

    await initExtension({ debugCaller: 'runtime.onInstalled' })
    updateActiveTab({
      debugCaller: 'runtime.onInstalled'
    });

    const savedObj = await getOptions([
      INTERNAL_VALUES.DATA_FORMAT,
      USER_OPTION.USE_FLAT_FOLDER_STRUCTURE,
    ]);

    if (savedObj[INTERNAL_VALUES.DATA_FORMAT] !== DATA_FORMAT) {
      await migration({ from: savedObj[INTERNAL_VALUES.DATA_FORMAT] })

      if (savedObj[USER_OPTION.USE_FLAT_FOLDER_STRUCTURE]) {
        await orderBookmarks()
      }
    }

    checkCommandShortcuts()

    //? browser.runtime.reload() to fix empty page options after update
  },
  async onMessage (message, sender) {
    logRC('runtime.onMessage message', message);

    await onIncomingMessage(message, sender)
  }
};
const logSC = makeLogFunction({ module: 'storage.controller' })

const storageController = {

  async onChanged(changes, namespace) {

    if (namespace === 'local') {
      const changesSet = new Set(Object.keys(changes))
      const userOptionSet = new Set(USER_OPTION_STORAGE_KEY_LIST)
      const intersectSet = changesSet.intersection(userOptionSet)

      if (intersectSet.size > 0) {
        logSC('storage.onChanged', namespace, changes);

        extensionSettings.invalidate()
        await initExtension({ debugCaller: 'storage.onChanged' })
      }
    }
  },
};
const logTC = makeLogFunction({ module: 'tabs.controller.js' })
const redirectedUrl = new CacheWithLimit({ name: 'redirectedUrl', size: 20 })

const tabsController = {
  // onCreated(Tab) {
  //   logTC('tabs.onCreated', Tab);
  // },
  async onUpdated(tabId, changeInfo, Tab) {
    logTC('tabs.onUpdated 00', 'tabId', tabId, 'Tab.index', Tab.index);
    logTC('tabs.onUpdated 00 ------changeInfo', changeInfo);
    // logTC('tabs.onUpdated 00 ------Tab', Tab);

    if (changeInfo?.url) {
      const newUrl = changeInfo.url
      const settings = await extensionSettings.get()

      if (settings[USER_OPTION.YOUTUBE_REDIRECT_CHANNEL_TO_VIDEOS]) {
        if (isYouTubeChannelWithoutSubdir(newUrl)) {

          const isRedirectedBefore = !!redirectedUrl.get(`${tabId}#${newUrl}`)
          logTC('tabs.onUpdated ', newUrl, 'isRedirectedBefore ', isRedirectedBefore);

          if (!isRedirectedBefore) {
            const oUrl = new URL(newUrl)
            oUrl.pathname = `${oUrl.pathname}/videos`
            const redirectUrl = oUrl.toString()
            logTC('tabs.onUpdated ', changeInfo?.status, 'tabId', tabId, 'redirectUrl', redirectUrl);

            redirectedUrl.add(`${tabId}#${newUrl}`)
            await browser.tabs.update(tabId, { url: redirectUrl })

            return
          }
        }
      }
    }

    if (Tab.active && changeInfo?.status == 'complete') {
      memo.activeTabUrl = Tab.url

      urlEvents.onPageReady({ tabId, url: Tab.url })

      updateActiveTab({
        tabId,
        debugCaller: `tabs.onUpdated complete`,
      })
    }

    const toChangeInfo = changeInfo?.status == 'complete'
      ? { title: Tab.title, ...changeInfo,  }
      : changeInfo
    visitedUrls.updateTab(tabId, toChangeInfo, Tab.active);
  },
  async onActivated({ tabId }) {
    logTC('tabs.onActivated 00', 'memo[\'activeTabId\'] <=', tabId);

    // detect tab was changed
    // if (memo.activeTabId !== tabId) {
    //   memo.previousTabId = memo.activeTabId;
    //   memo.activeTabId = tabId;
    // }
    memo.activeTabId = tabId;

    updateActiveTab({
      tabId,
      debugCaller: 'tabs.onActivated'
    });

    try {
      const Tab = await browser.tabs.get(tabId);

      if (Tab) {
        logTC('tabs.onActivated 11', Tab.index, tabId, Tab.url);
        // Chrome for new tab: empty Tab.url, empty Tab.title, not empty Tab.pendingUrl
        // Chrome for existed tab: not empty Tab.url, not empty Tab.title, undefined Tab.pendingUrl
        memo.activeTabUrl = Tab.pendingUrl || Tab.url

        // QUESTION: on open windows with stored tabs. every tab is activated?
        // firefox: only one active tab
        visitedUrls.visitTab(tabId, memo.activeTabUrl, Tab.title)
        urlEvents.onVisitUrl({ url: memo.activeTabUrl })
      }
    } catch (er) {
      logTC('tabs.onActivated. IGNORING. tab was deleted', er);
    }
  },
  async onRemoved(tabId) {
    logTC('tabs.onRemoved 00', tabId);
    // 1) manually close active tab
    // 2) manually close not active tab
    // 3) close tab on close window = 1)

    visitedUrls.closeTab(tabId)
  }
}
const logWC = makeLogFunction({ module: 'windows.controller' })

const windowsController = {
  async onFocusChanged(windowId) {
    logWC('windows.onFocusChanged', windowId);

    if (!(0 < windowId)) {
      return
    }

    logWC('windows.onFocusChanged', windowId);
    await setFirstActiveTab({ debugCaller: 'windows.onFocusChanged' })
    updateActiveTab({
      debugCaller: 'windows.onFocusChanged'
    });
  },
};
browser.storage.onChanged.addListener(storageController.onChanged);

browser.bookmarks.onCreated.addListener(bookmarksController.onCreated);
browser.bookmarks.onMoved.addListener(bookmarksController.onMoved);
browser.bookmarks.onChanged.addListener(bookmarksController.onChanged);
browser.bookmarks.onRemoved.addListener(bookmarksController.onRemoved);

// listen for window switching
browser.windows.onFocusChanged.addListener(windowsController.onFocusChanged);

// browser.tabs.onCreated.addListener(tabsController.onCreated);
browser.tabs.onUpdated.addListener(tabsController.onUpdated);
// listen for tab switching
browser.tabs.onActivated.addListener(tabsController.onActivated);
browser.tabs.onRemoved.addListener(tabsController.onRemoved);

browser.commands.onCommand.addListener(commandsController.onCommand);
browser.menus.onClicked.addListener(contextMenusController.onClicked);

browser.runtime.onStartup.addListener(runtimeController.onStartup)
browser.runtime.onInstalled.addListener(runtimeController.onInstalled);
browser.runtime.onMessage.addListener(runtimeController.onMessage);