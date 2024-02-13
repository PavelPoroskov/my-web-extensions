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
    'z-index: 999',
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
        log('update', el.childNodes[0]);
        el.replaceChild(textNode, el.childNodes[0]);
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

        // el.style = "position: absolute; right: 0; top: 0; z-index: 999; background-color: yellow; color: black"
        // document.body.appendChild(el);
        if (document.body.firstChild) {
          document.body.insertBefore(rootInfo, document.body.firstChild);
        } else {
          document.body.appendChild(rootInfo);
        }
        
      }
    } else {
      const elem = document.getElementById(uniqBkmNotifyId);
      if (elem && elem.parentNode) {
        elem.parentNode.removeChild(elem);
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
