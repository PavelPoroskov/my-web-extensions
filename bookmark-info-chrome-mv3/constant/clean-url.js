
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
  {
    hostname: 'djinni.co',
    paths: [
      '/my/profile/',
      '/jobs/',
    ] 
  },
  {
    hostname: 'frontendmasters.com',
    paths: [
      '/courses/',
    ] 
  },
  {
    hostname: 'imdb.com',  
    paths: [
      '/title/',
      '/list/',
      '/imdbpicks/',
      '/interest/',
    ] 
  },
  {
    hostname: 'linkedin.com',  
    paths: [
      '/jobs/view/',
      '/posts/'
    ] 
  },
  {
    hostname: 'udemy.com',  
    paths: [
      '/course/',
    ] 
  },
]
