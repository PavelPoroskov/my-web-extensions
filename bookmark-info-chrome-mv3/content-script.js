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

  const uniqBookmarkInfoId = 'uniqBookmarkInfoId';

  const rootInfoStyle = [
    'position: fixed',
    'right: 0',
    'top: 0',
    'z-index: 2147483647',
    'display: flex',
    'background-color: transparent',
  ].join(';');

  const labelStyle = [
    'background-color: yellow',
    'color: black',
    'font-size: 14px',
    'padding-left: 0.7ch',
    'border-top-left-radius: 0.5lh 50%',
    'border-bottom-left-radius: 0.5lh 50%',
    'font-family: sans-serif',
    'font-weight: normal',
    'line-height: 1.2',
  ].join(';');

  function showBookmarkInfo(message) {
    log('showBookmarkInfo 00');
    if (message) {
      log('showBookmarkInfo 11');  
      let el = document.getElementById(uniqBookmarkInfoId);
  
      // createTextNode is safe method for XSS-injection
      const textNode = document.createTextNode(message);

      if (el) {
        log('showBookmarkInfo 11 11 1');
        log('update', el.firstChild);
        if (el.firstChild) {
          el.replaceChild(textNode, el.firstChild);
        } else {
          el.appendChild(textNode);
        }
      } else {
        log('showBookmarkInfo 22 2');
        const rootInfo = document.createElement('div');
        rootInfo.style = rootInfoStyle;
        const divL = document.createElement('div');
        divL.style = "flex: 1;"
        const divM = document.createElement('div');

        const divR = document.createElement('div');
        divR.setAttribute('id',uniqBookmarkInfoId);
        divR.style = labelStyle;
        divR.appendChild(textNode);

        rootInfo.appendChild(divL);
        rootInfo.appendChild(divM);
        rootInfo.appendChild(divR);

        document.body.insertAdjacentElement('afterbegin', rootInfo);        
      }
    } else {
      const elem = document.getElementById(uniqBookmarkInfoId);
      if (elem?.firstChild) {
        elem.removeChild(elem.firstChild);
      }
    }
  }
  
  chrome.runtime.onMessage.addListener((message) => {
    if (message.command === "bookmarkInfo") {
      log('content-script: ', message.folderName, message.double);

      if (message.folderName) {
        const strMessage = message.double > 1
        ? `${message.folderName} :d${message.double} bkm`
        : `${message.folderName} :bkm`;
        showBookmarkInfo(strMessage);
      } else {
        //clear
        showBookmarkInfo();
      }
    }
  });
})();
