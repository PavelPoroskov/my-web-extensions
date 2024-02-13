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

  const uniqBkmNotifyId = 'uniqBkmNotifyId'

  function showFolder(text) {
    log('showNotification 00');
    if (text) {
      log('showNotification 11');  
      let el = document.getElementById(uniqBkmNotifyId);
  
      if (el) {
        log('showNotification 11 11');
        const textNode = document.createTextNode(`${text} :bkmk`);
        log('update', el.childNodes[0]);
        el.replaceChild(textNode, el.childNodes[0]);
      } else {
        log('showNotification 22');
        el = document.createElement('div');
        el.setAttribute('id',uniqBkmNotifyId);
        const textNode = document.createTextNode(`${text} :bkmk`);
        el.appendChild(textNode);
        // el.style = "position: absolute; position: -webkit-sticky; position: sticky; right: 0; top: 0; z-index: 999; background-color: yellow; color: black"
        el.style = "position: absolute; right: 0; top: 0; z-index: 999; background-color: yellow; color: black"
        // document.body.appendChild(el);
        if (document.body.firstChild) {
          document.body.insertBefore(el, document.body.firstChild);
        } else {
          document.body.appendChild(el);
        }
        
      }
    } else {
      const elem = document.getElementById(uniqBkmNotifyId);
      if (elem && elem.parentNode) {
        elem.parentNode.removeChild(elem);
      }
    }
  }
  
  browser.runtime.onMessage.addListener((message) => {
    if (message.command === "bookmarkFolder") {
      log('content-script: ', message.bookmarkFolder);
      showFolder(message.bookmarkFolder);
    }
  });
})();
