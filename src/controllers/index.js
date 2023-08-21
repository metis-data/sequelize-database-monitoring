const titleRatings = require('../titles/title_ratings.controller');
const titles = require('../titles/titles.controller');

function initialize(router) {
  titleRatings.initialize(router);
  titles.initialize(router);
}

module.exports = {
  initialize,
};
