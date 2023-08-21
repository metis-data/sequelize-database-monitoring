require('dotenv').config();
const request = require('supertest');

describe('AppController (e2e)', function (){
  this.timeout(0);

  const endpoints = [
    '/titles/ratings/best',
    '/titles?title=Test',
    '/titlesForAnActor?nconst=nm1588970',
    '/highestRatedMoviesForAnActor?nconst=nm1588970',
    '/highestRatedMovies?numvotes=10000',
    '/commonMoviesForTwoActors?actor1=nm0302368&actor2=nm0001908',
    '/crewOfGivenMovie?tconst=tt0000439',
    '/mostProlificActorInPeriod?startYear=1900&endYear=1912',
    '/mostProlificActorInGenre?genre=Action',
    '/mostCommonTeammates?nconst=nm0000428',
  ];

  let app;

  before(async function() {
    this.timeout(0);
    
    app = require('../app');
  });

  endpoints.map(url => it(`${url} (GET)`, async function() {
    await request(app)
      .get(url)
      .expect(200);
  }));
});
