'use strict';

const fs = require('fs');
const { Utils } = require('../utils');

module.exports = {
  name: '!lol_track_player',
  description: 'Tracker player result!',
  execute(msg, args) {
    Utils.getLolTrackedPlayer().then(trackedPlayer => {
      let newTrackedPlayer = [];
      args.forEach(playerName => {
        if (!trackedPlayer.includes(playerName)) {
          trackedPlayer.push(playerName);
          newTrackedPlayer.push(playerName);
        }
        else {
          trackedPlayer
          msg.channel.send(`Le joueur ${playerName} est déjà tracké.`);
        }
      });
      Utils.writeLolTrackerPlayer(trackedPlayer)
        .then(() => {
          newTrackedPlayer.forEach(playerName => {
            msg.channel.send(`Le joueur ${playerName} est maintenant tracké.`);
          });
        })
        .catch((err) => {
          msg.channel.send(`Un erreur s'est produite.`);
        });
    })
  },
};