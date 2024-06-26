const BROWSER_OPTIONS = {
  CHROME: 'CHROME',
  FIREFOX: 'FIREFOX',
}
const BROWSER_SPECIFIC_OPTIONS = {
  [BROWSER_OPTIONS.CHROME]: {
    MENU_CONTEXT: ['all'],
  },
  [BROWSER_OPTIONS.FIREFOX]: {
    MENU_CONTEXT: ['all','tab'],
  },
}
const BROWSER = BROWSER_OPTIONS.CHROME;
export const IS_BROWSER_FIREFOX = BROWSER === BROWSER_OPTIONS.FIREFOX;
export const BROWSER_SPECIFIC = BROWSER_SPECIFIC_OPTIONS[BROWSER];

export const SOURCE = {
  CACHE: 'CACHE',
  ACTUAL: 'ACTUAL',
};

const BASE_ID = 'BKM_INF';

export const MENU = {
  CLOSE_DUPLICATE: `${BASE_ID}_CLOSE_DUPLICATE`,
  CLOSE_BOOKMARKED: `${BASE_ID}_CLOSE_BOOKMARKED`,
  CLEAR_URL: `${BASE_ID}_CLEAR_URL`,
  // BOOKMARK_AND_CLOSE: `${BASE_ID}_BOOKMARK_AND_CLOSE`,
};

export const USER_SETTINGS_OPTIONS = {
  CLEAR_URL_FROM_QUERY_PARAMS: 'CLEAR_URL_FROM_QUERY_PARAMS',
  SHOW_PATH_LAYERS: 'SHOW_PATH_LAYERS',
  SHOW_PREVIOUS_VISIT: 'SHOW_PREVIOUS_VISIT',
  SHOW_BOOKMARK_TITLE: 'SHOW_BOOKMARK_TITLE',
  SHOW_PROFILE: 'SHOW_PROFILE',
  ADD_BOOKMARK: 'ADD_BOOKMARK',
  // MARK_VISITED_URL: 'MARK_VISITED_URL',
}

export const SHOW_PREVIOUS_VISIT_OPTION = {
  NEVER: 0,
  ONLY_NO_BKM: 1,
  ALWAYS: 2,
}
const o = USER_SETTINGS_OPTIONS
export const USER_SETTINGS_DEFAULT_VALUE = {
  [o.CLEAR_URL_FROM_QUERY_PARAMS]: true,
  [o.SHOW_PATH_LAYERS]: 1, // [1, 2, 3]
  [o.SHOW_PREVIOUS_VISIT]: SHOW_PREVIOUS_VISIT_OPTION.ALWAYS,
  [o.SHOW_BOOKMARK_TITLE]: false,
  [o.SHOW_PROFILE]: false,
  [o.ADD_BOOKMARK]: false,
}

export const clearUrlTargetList = [
  {
    hostname: 'linkedin.com',  
    paths: [
      '/jobs/view/',
      '/posts/'
    ] 
  },
  {
    hostname: 'djinni.co',
    paths: [
      '/my/profile/',
      '/jobs/',
    ] 
  },
  {
    hostname: 'imdb.com',  
    paths: [
      '/title/',
      '/list/',
    ] 
  },
  {
    hostname: 'udemy.com',  
    paths: [
      '/course/',
    ] 
  },
]

export const TAG_LIST_VISIBLE_LIMIT = 25;