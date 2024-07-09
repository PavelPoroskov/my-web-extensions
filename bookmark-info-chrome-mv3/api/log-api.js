import { LOG_CONFIG } from '../constant/log-config.js'

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

export const log = LOG_CONFIG.SHOW_LOG ? makeLogWithPrefix() : () => { };
export const logCache = LOG_CONFIG.SHOW_LOG_CACHE ? logWithTime : () => { };
export const logSendEvent = LOG_CONFIG.SHOW_LOG_EVENT_OUT ? makeLogWithPrefix('SEND =>') : () => { };
export const logEvent = LOG_CONFIG.SHOW_LOG_EVENT_IN ? makeLogWithPrefix('EVENT <=') : () => { };
export const logIgnore = LOG_CONFIG.SHOW_LOG_IGNORE ? makeLogWithPrefix('IGNORE') : () => { };
export const logOptimization = LOG_CONFIG.SHOW_LOG_OPTIMIZATION ? makeLogWithPrefix('OPTIMIZATION') : () => { };
export const logPromiseQueue = LOG_CONFIG.SHOW_LOG_QUEUE ? logWithTime : () => { };
export const logDebug = LOG_CONFIG.SHOW_DEBUG ? makeLogWithPrefix('DEBUG') : () => { };
export const logSettings = LOG_CONFIG.SHOW_SETTINGS ? makeLogWithPrefix('SETTINGS') : () => { };

