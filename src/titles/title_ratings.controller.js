const titleRatingService = require('./title_ratings.service');

module.exports = {
  initialize(router) {
    router.get('/titles/ratings/best', this.handleResult(this.getBestMovies));
  },

  getBestMovies(req, res) {
    return titleRatingService.getBestMovies();
  },

  handleResult(lambda) {
    return (req, res) => Promise.resolve(lambda(req, res))
      .then((results) => res.status(200).send(results))
      .catch((error) => { console.log(error); res.status(400).send(error); });
  }
};
