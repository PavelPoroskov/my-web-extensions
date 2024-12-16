export const clearUrlTargetList = [
  // TODO-NEXT if we clean url on open then we loose check-in, check-out dates
  //    need search bookmark for clean url
  //    strategy01: clean url on open
  //    strategy02: clean url on save
  //    strategy00: don't clear url, default
  // {
  //   hostname: 'airbnb.com',  
  //   paths: [
  //     '/rooms/',
  //   ] 
  // },
  // {
  //   hostname: 'djinni.co',
  //   removeAllSearchParamForPath: [
  //     '/my/profile/',
  //     '/jobs/',
  //   ] 
  // },
  {
    hostname: 'frontendmasters.com',
    removeAllSearchParamForPath: [
      '/courses/:id/',
    ] 
  },
  {
    hostname: 'hh.ru',  
    removeSearchParamList: [
      'hhtmFrom',
      'hhtmFromLabel',
    ],
    removeAllSearchParamForPath: [
      '/vacancy/:id',
    ],
  },
  {
    hostname: 'imdb.com',  
    removeSearchParamList: [
      'ref_',
    ],
    removeAllSearchParamForPath: [
      '/title/',
      '/list/',
      '/imdbpicks/',
      '/interest/',
      '/',
    ],
  },
  {
    hostname: 'linkedin.com',  
    removeAllSearchParamForPath: [
      '/jobs/view/',
      '/posts/'
    ] 
  },
  {
    hostname: 'udemy.com',  
    removeAllSearchParamForPath: [
      '/course/:id/',
    ] 
  },
]
