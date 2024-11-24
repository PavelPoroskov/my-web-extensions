import { logModuleMap } from './log-api-config.js'

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

// eslint-disable-next-line no-unused-vars
const makeLogWithPrefixAndTime = (prefix = '') => {
  return function () {  
    const ar = Array.from(arguments);

    if (prefix) {
      ar.unshift(prefix);
    }

    logWithTime(...ar);
  }
}

export const makeLogFunction = ({ module }) => {

  const isLogging = logModuleMap[module] || false

  if (!isLogging) {
    return () => {}
  }

  const prefix = module;

  return function () {
    const ar = Array.from(arguments);
    ar.unshift(prefix);
    console.log(...ar);
  }
}