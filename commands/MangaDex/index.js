'use strict';

module.exports =
{
  name: 'md',
  description: 'Commandes liées à MangaDex',
  availableCommands: {
    GetManga: require('./get_manga'),
  }
};