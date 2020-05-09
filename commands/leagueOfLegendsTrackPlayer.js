'use strict';

const fs = require('fs');
const { Utils } = require('../utils');

module.exports = {
  name: '!lol_track_player',
  description: 'Tracker player result!',
  execute(msg, args) {
    Utils.getLolTrackedPlayer().then(trackedPlayer => {
      args.forEach(playerName => {
        if (!trackedPlayer.includes(playerName)) {
          trackedPlayer.push(playerName);
        }
        else {
          msg.channel.send(`Le joueur ${playerName} est déjà tracké.`);
        }
      });
      Utils.writeLolTrackerPlayer(trackedPlayer)
        .then(() => {
          msg.channel.send(`Le joueur ${playerName} est maintenant tracké.`);
        })
        .catch(() => {
          msg.channel.send(`Un erreur s'est produite.`);
        });
    })
  },
};