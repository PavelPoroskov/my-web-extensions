
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

export const isNotEmptyArray = (ar) => Array.isArray(ar) && ar.length > 0
