
export function debounce(func, timeout = 300){
  let timer;

  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(
      () => {
        func.apply(this, args);
      },
      timeout,
    );
  };
}

const MS_DIFF_FOR_SINGLE_BKM = 80

export function debounce_leading(func, timeout = 300){
  let timer;

  return (...args) => {
    if (!timer) {
      func.apply(this, args);
    }

    clearTimeout(timer);
    timer = setTimeout(
      () => {
        timer = undefined;
      },
      timeout,
    );
  };
}

export function ignoreBatch(func, timeout = MS_DIFF_FOR_SINGLE_BKM){
  let lastCallTime
  let timer;
  let isBatch

  return (...args) => {
    const now = Date.now()

    if (lastCallTime) {
      isBatch = now - lastCallTime < MS_DIFF_FOR_SINGLE_BKM
    } else {
      isBatch = false
    }

    lastCallTime = now

    clearTimeout(timer);

    timer = setTimeout(
      () => {
        if (!isBatch) {
          func.apply(this, args);
        }
      },
      timeout,
    );
  };
}

export const isNotEmptyArray = (ar) => Array.isArray(ar) && ar.length > 0
