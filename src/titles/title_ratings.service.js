const titleRating = require('../models').TitleRating;

module.exports = {
  getBestMovies() {
    return titleRating
      .findAll({
        where: {
          averagerating: 10.0
        }
      });
  }
};
