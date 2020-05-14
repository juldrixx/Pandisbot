'use strict';

const { MessageEmbed } = require('discord.js');
const { Utils } = require('../utils');

module.exports = {
  name: '!lol_last_game',
  description: 'Get the last game of Legend Of Legends result!',
  execute(msg, args) {
    args.forEach(playerName => {
      Utils.getLolLastGameInfo(playerName)
        .then((gameInfo) => {
          const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`${gameInfo.resultMatch ? 'Victoire' : 'Défaite'} pour ${playerName} !`)
            .setDescription(`Score : ${gameInfo.scoreMatch}`)
            .setThumbnail(gameInfo.championImg)
            .addField(`Type de partie : ${gameInfo.gameType === 'MATCHED_GAME' ? 'Classée' : 'Normal'}`)
            .setTimestamp()
            .setFooter('Pandisbot');
          msg.channel.send(embed);
        })
        .catch(() => { })
    });
  },
};