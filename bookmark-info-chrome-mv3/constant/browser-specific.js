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
const BROWSER = BROWSER_OPTIONS.CHROME;
export const IS_BROWSER_CHROME = BROWSER === BROWSER_OPTIONS.CHROME;
export const IS_BROWSER_FIREFOX = BROWSER === BROWSER_OPTIONS.FIREFOX;

export const BROWSER_SPECIFIC = Object.fromEntries(
  Object.entries(BROWSER_SPECIFIC_OPTIONS)
    .map(([option, obj]) => [option, obj[BROWSER]])
);
