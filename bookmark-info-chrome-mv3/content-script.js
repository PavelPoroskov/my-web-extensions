const SHOW_LOG = true
const log = SHOW_LOG ? console.log : () => {};

(function() {
  console.log('IN content-script');
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
    'position: absolute',
    'position: -webkit-sticky',
    // 'position: sticky',
    'position: fixed',
    'right: 0',
    'top: 0',
    'z-index: 9999',
    'display: flex',
    'background-color: transparent',
  ].join(';');

  function showBookmarkInfo(text) {
    log('showBookmarkInfo 00');
    if (text) {
      log('showBookmarkInfo 11');  
      let el = document.getElementById(uniqBookmarkInfoId);
  
      // createTextNode is safe method. createTextNode
      const textNode = document.createTextNode(`${text} :bkm`);

      if (el) {
        log('showBookmarkInfo 11 11');
        log('update', el.firstChild);
        if (el.firstChild) {
          el.replaceChild(textNode, el.firstChild);
        } else {
          el.appendChild(textNode);
        }
      } else {
        log('showBookmarkInfo 22');
        const rootInfo = document.createElement('div');
        rootInfo.style = rootInfoStyle;
        const divL = document.createElement('div');
        divL.style = "flex: 1;"
        const divM = document.createElement('div');

        const divR = document.createElement('div');
        divR.setAttribute('id',uniqBookmarkInfoId);
        divR.style = "background-color: yellow; color: black"
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
      log('content-script: ', message.folderName);
      showBookmarkInfo(message.folderName);
    }
  });
})();
