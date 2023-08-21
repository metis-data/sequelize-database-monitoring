const titlesService = require('./titles.service');

module.exports = {
  initialize(router) {
    router.get('/titles', this.handleResult(this.getTitles));
    router.get('/titlesForAnActor', this.handleResult(this.titlesForAnActor));
    router.get('/highestRatedMoviesForAnActor', this.handleResult(this.highestRatedMoviesForAnActor));
    router.get('/highestRatedMovies', this.handleResult(this.highestRatedMovies));
    router.get('/commonMoviesForTwoActors', this.handleResult(this.commonMoviesForTwoActors));
    router.get('/crewOfGivenMovie', this.handleResult(this.crewOfGivenMovie));
    router.get('/mostProlificActorInPeriod', this.handleResult(this.mostProlificActorInPeriod));
    router.get('/mostProlificActorInGenre', this.handleResult(this.mostProlificActorInGenre));
    router.get('/mostCommonTeammates', this.handleResult(this.mostCommonTeammates));
  },

  getTitles(req, res) {
    return titlesService.getTitles(req.query.title);
  },

  titlesForAnActor(req, res) {
    return titlesService.titlesForAnActor(req.query.nconst);
  },

  highestRatedMoviesForAnActor(req, res) {
    return titlesService.highestRatedMoviesForAnActor(req.query.nconst);
  },

  highestRatedMovies(req, res) {
    return titlesService.highestRatedMovies(req.query.numvotes);
  },

  commonMoviesForTwoActors(req, res) {
    return titlesService.commonMoviesForTwoActors(req.query.actor1, req.query.actor2);
  },

  crewOfGivenMovie(req, res) {
    return titlesService.crewOfGivenMovie(req.query.tconst);
  },

  mostProlificActorInPeriod(req, res) {
    return titlesService.mostProlificActorInPeriod(req.query.startYear, req.query.endYear);
  },

  mostProlificActorInGenre(req, res) {
    return titlesService.mostProlificActorInGenre(req.query.genre);
  },

  mostCommonTeammates(req, res) {
    return titlesService.mostCommonTeammates(req.query.nconst);
  },

  handleResult(lambda) {
    return (req, res) => Promise.resolve(lambda(req, res))
      .then((results) => res.status(200).send(results))
      .catch((error) => { console.log(error); res.status(400).send(error); });
  }
};
