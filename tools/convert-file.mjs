export const convertFileContent = (inStr) => {
  let result = inStr;

  const usedDependencies = [];
  result = result.replaceAll(
    // eslint-disable-next-line
    /import\s+[{\s\w,}]*from\s+\'(?<dependency>[^\']*)\'[;]*\s+/g,
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
  result = result.replaceAll(`contexts: ['page']`, `contexts: ['page','tab']`);
  result = result.replaceAll(`'padding-right: 0.5ch'`, `'padding-right: 0.7ch'`);
  

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