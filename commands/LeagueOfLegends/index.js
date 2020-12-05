'use strict';

module.exports =
{
  name: 'lol',
  description: 'Commandes liées à League Of Legends',
  availableCommands: {
    TrackPlayer: require('./track_player'),
    UnTrackerPlayer: require('./untrack_player'),
    LastGame: require('./last_game'),
  }
};