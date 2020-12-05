'use strict';

module.exports = {
  ...require('./tracker'),
  ...require('./last_game'),
  ...require('./rank'),
  API: require('./api'),
};