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
  // BOOKMARK_AND_CLOSE: `${BASE_ID}_BOOKMARK_AND_CLOSE`,
};
