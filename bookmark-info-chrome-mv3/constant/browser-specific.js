const BROWSER_OPTIONS = {
  CHROME: 'CHROME',
  FIREFOX: 'FIREFOX',
}

const BROWSER_SPECIFIC_OPTIONS = {
  MENU_CONTEXT: {
    [BROWSER_OPTIONS.CHROME]: ['all'],
    [BROWSER_OPTIONS.FIREFOX]: ['all','tab']
  },
  // TODO remove duplication for DEL_BTN_RIGHT_PADDING, LABEL_RIGHT_PADDING in context-script
  // ? can context script import file.js
  // OR insert to context-script on build
  DEL_BTN_RIGHT_PADDING: {
    [BROWSER_OPTIONS.CHROME]: '0.5ch',
    [BROWSER_OPTIONS.FIREFOX]: '1ch'
  },
  LABEL_RIGHT_PADDING: {
    [BROWSER_OPTIONS.CHROME]: '0.3ch',
    [BROWSER_OPTIONS.FIREFOX]: '0.6ch'
  }
}

const BROWSER = BROWSER_OPTIONS.CHROME;

export const IS_BROWSER_FIREFOX = BROWSER === BROWSER_OPTIONS.FIREFOX;
export const BROWSER_SPECIFIC = Object.fromEntries(
  Object.entries(BROWSER_SPECIFIC_OPTIONS)
    .map(([option, obj]) => [option, obj[BROWSER]])
);
