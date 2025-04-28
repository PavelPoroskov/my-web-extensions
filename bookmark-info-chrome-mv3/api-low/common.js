
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

export const isNotEmptyArray = (ar) => Array.isArray(ar) && ar.length > 0
