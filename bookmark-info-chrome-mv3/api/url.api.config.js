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
    // removeAllSearchParamForPath: [
    //   '/title/',
    //   '/list/',
    //   '/imdbpicks/',
    //   '/interest/',
    //   '/',
    // ],
    importantSearchParamList: [
      'season', // https://www.imdb.com/title/tt8111088/episodes/?season=3&ref_=tt_eps_sn_3
    ],
  },
  // TODO the same
  // https://www.linkedin.com/jobs/collections/recommended/?currentJobId=4096094176
  // https://www.linkedin.com/jobs/view/4096094176/?alternateChannel=search&refId=WYo23okoaVDvmJkLoaclcg%3D%3D&trackingId=bTIytUCJN%2BDpKjaalPv4gg%3D%3D
  // https://www.linkedin.com/jobs/search/?currentJobId=4096094176&geoId=106686604&origin=JOBS_HOME_LOCATION_AUTOCOMPLETE&refresh=true
  {
    hostname: 'linkedin.com',  
    removeAllSearchParamForPath: [
      '/jobs/view/:id/',
      '/posts/:id/'
    ] 
  },
  {
    hostname: 'udemy.com',  
    removeAllSearchParamForPath: [
      '/course/:id/',
    ] 
  },
  {
    hostname: 'youtube.com',  
    hostnameAliasList: ['youtu.be'],  
    importantSearchParamList: [
      'v', // https://www.youtube.com/watch?v=qqqqq
    ],
  },
  // TODO domain has 3 parts
  {
    hostname: 'www.google.com',  
    importantSearchParamList: [
      'q', // https://www.google.com/search?q=react-native
    ],
  },  
  {
    hostname: 'forcoder.net',  
    importantSearchParamList: [
      's', // https://forcoder.net/?s=CQRS
    ],
  },
]

// all articles of author
// https://dev.to/codewithsadee
//  https://dev.to/:author
//
// article
// https://dev.to/codewithsadee/build-deploy-a-stunning-saas-landing-page-with-react-tailwind-51p0
//  https://dev.to/:author/:slug
//
// https://www.youtube.com/watch?v=qqqqq
//  // https://www.youtube.com/watch?v=:slug
