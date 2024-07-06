/* TODO support import with comment
import {
  // logDebug,
  logOptimization,
} from './debug.js'
*/
export const convertFileContent = (inStr) => {
  let result = inStr;

  const usedDependencies = [];
  result = result.replaceAll(
    // eslint-disable-next-line
    /(?:import|export)\s+[{\s\w,\*\/}]*from\s+\'(?<dependency>[^\']+)\'[;]*\s*/g,
    function (_, dependency) {
      // console.log('Replace', arguments[0], '##');
      // console.log('Replace', arguments);
      usedDependencies.push(dependency);

      return '';
    }
  )

  result = result.replaceAll('export ', '');
  result = result.replaceAll('chrome.', 'browser.');
  result = result.replaceAll('browser.contextMenus.', 'browser.menus.');
  result = result.replaceAll(
    'const BROWSER = BROWSER_OPTIONS.CHROME;',
    'const BROWSER = BROWSER_OPTIONS.FIREFOX;'
  );  

  let indexStart = 0;
  while ('\n\r'.includes(result[indexStart])) {
    indexStart += 1;
  }

  let indexEnd = result.length - 1;
  while ('\n\r'.includes(result[indexEnd])) {
    indexEnd -= 1;
  }

  result = result.slice(indexStart, indexEnd + 1);
  
  return {
    content: result,
    usedDependencies,
  };
}