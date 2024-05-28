import { CONFIG } from '../config.js'

const makeLogWithTime = () => {
  let startTime;
  let prevLogTime;

  return function () {
    if (!startTime) {
      startTime = Date.now();
      prevLogTime = startTime;
    }

    const newLogTime = Date.now();
    // const dif = (newLogTime - prevLogTime)/1000;
    const dif = (newLogTime - prevLogTime);
    prevLogTime = newLogTime;
  
    const ar = Array.from(arguments);
    ar.unshift(`+${dif}`);
    console.log(...ar);
  }
}

const logWithTime = makeLogWithTime();

const makeLogWithPrefix = (prefix = '') => {
  return function () {  
    const ar = Array.from(arguments);

    if (prefix) {
      ar.unshift(prefix);
    }

    logWithTime(...ar);
  }
}

export const log = CONFIG.SHOW_LOG ? makeLogWithPrefix() : () => { };
export const logCache = CONFIG.SHOW_LOG_CACHE ? logWithTime : () => { };
export const logSendEvent = CONFIG.SHOW_LOG_SEND_EVENT ? makeLogWithPrefix('SEND =>') : () => { };
export const logEvent = CONFIG.SHOW_LOG_EVENT ? makeLogWithPrefix('EVENT <=') : () => { };
export const logIgnore = CONFIG.SHOW_LOG_IGNORE ? makeLogWithPrefix('IGNORE') : () => { };
export const logOptimization = CONFIG.SHOW_LOG_OPTIMIZATION ? makeLogWithPrefix('OPTIMIZATION') : () => { };
export const logPromiseQueue = CONFIG.SHOW_LOG_QUEUE ? logWithTime : () => { };
export const logDebug = CONFIG.SHOW_DEBUG ? makeLogWithPrefix('DEBUG') : () => { };

