const SHOW_LOG = false
const log = SHOW_LOG ? console.log : () => {};

(function() {
  log('IN content-script');
  /**
   * Check and set a global guard variable.
   * If this content script is injected into the same page again,
   * it will do nothing next time.
   */
  if (window.hasRun) {
    return;
  }
  window.hasRun = true;

  const bkmInfoRootId = 'bkmInfoRootId';

  const rootInfoStyle = [
    'position: fixed',
    'right: 0',
    'top: 0',
    'z-index: 2147483647',
    'background-color: transparent',
  ].join(';');

  const labelStyle = [
    'color: black',
    'font-size: 14px',
    'padding-left: 0.7ch',
    'border-top-left-radius: 0.5lh 50%',
    'border-bottom-left-radius: 0.5lh 50%',
    'font-family: sans-serif',
    'font-weight: normal',
    'line-height: 1.2',
  ].join(';');

  function showBookmarkInfo(bkmInfoList) {
    log('showBookmarkInfo 00');

    let rootDiv = document.getElementById(bkmInfoRootId);

    if (!rootDiv) {
      log('showBookmarkInfo 22 2');
      rootDiv = document.createElement('div');
      rootDiv.setAttribute('id', bkmInfoRootId);
      rootDiv.style = rootInfoStyle;

      document.body.insertAdjacentElement('afterbegin', rootDiv);        
    }
  
    const colors = [
      'yellow',
      'orange'
    ]
    const rawNodeList = rootDiv.childNodes;
    const beforeRawLength = rawNodeList.length;

    bkmInfoList.forEach(({ folderName }, index) => {
      const divRow = document.createElement('div');
      divRow.style = 'display: flex'; // 'background-color: transparent'

      const divL = document.createElement('div');
      divL.style = "flex: 1;"

      const divR = document.createElement('div');
      divR.style = `${labelStyle};background-color:${colors[index % 2]}`;

      // createTextNode is safe method for XSS-injection
      const textNode = document.createTextNode(`${folderName} :bkm`);
      divR.appendChild(textNode);

      divRow.appendChild(divL);
      divRow.appendChild(divR);
      
      if (index < beforeRawLength) {
        rootDiv.replaceChild(divRow, rawNodeList[index]);
      } else {
        rootDiv.appendChild(divRow);
      }
    })

    let rawListLength = beforeRawLength;
    while (bkmInfoList.length < rawListLength) {
      rootDiv.removeChild(rootDiv.lastChild);
      rawListLength -= 1;
    }
  }

  browser.runtime.onMessage.addListener((message) => {
    if (message.command === "bookmarkInfo") {
      log('content-script: ', message.bookmarkInfoList);

      showBookmarkInfo(message.bookmarkInfoList);
    }
  });
})();