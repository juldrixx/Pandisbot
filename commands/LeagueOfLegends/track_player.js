'use strict';

const { LeagueOfLegendsUtils } = require('../../utils');

module.exports = {
  name: 'track',
  description: 'Permet de suivre les résultats d\'un joueur de League Of Legends',
  execute(msg, args) {
    const playerToTrack = args.join(' ');

    const call = async () => {
      const result = await LeagueOfLegendsUtils.trackPlayer(playerToTrack);
      msg.channel.send(result);
    }

    call().catch(err => {
      console.error(`Error: ${err}`);
      msg.channel.send(`Une erreur s'est produite.`);
    });
  },
};