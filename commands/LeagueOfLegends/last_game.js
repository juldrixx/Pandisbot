'use strict';

const { MessageEmbed } = require('discord.js');
const { LeagueOfLegendsUtils } = require('../../utils');

module.exports = {
  name: 'last',
  description: 'Permet de récupérer le résultat du dernier match League Of Legends d\'un joueur',
  execute(msg, args) {
    const playerName = args.join(' ');

    const call = async () => {
      const result = await LeagueOfLegendsUtils.getUpdateFromLastGame(playerName);
      
      const embed = new MessageEmbed()
        .setColor(result.stats.win ? '#52a832' : '#a83a32')
        .setTitle(`${result.stats.win ? 'Victoire' : 'Défaite'} pour ${playerName} !`)
        .setDescription(`Score : ${result.stats.kills}/${result.stats.deaths}/${result.stats.assists}`)
        .setThumbnail(result.championImg)
        .addField(result.queueName, result.queueChangement)
        .setTimestamp()
        .setFooter('Pandisbot');
      msg.channel.send(embed);
    }

    call().catch(err => {
      console.error(`Error: ${err}`);
      msg.channel.send(`Une erreur s'est produite.`);
    });
  },
};