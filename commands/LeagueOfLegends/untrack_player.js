'use strict';

const { LeagueOfLegendsUtils } = require('../../utils');

module.exports = {
  name: 'untrack',
  description: 'Permet de ne plus suivre les résultats d\'un joueur de League Of Legends',
  arguments: 'player_name',
  execute(msg, args) {
    const playerToUntrack = args.join(' ');

    const call = async () => {
      const result = await LeagueOfLegendsUtils.untrackPlayer(playerToUntrack);
      msg.channel.send(result);
    }

    call().catch(err => {
      console.error(`Error: ${err}`);
      msg.channel.send(`Une erreur s'est produite.`);
    });
  },
};