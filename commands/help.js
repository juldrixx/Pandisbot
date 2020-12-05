'use strict';
const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'help',
  description: 'Donne des informations sur les commandes disponibles',
  execute(msg, args) {
    const botCommands = require('./');
    const embed = new MessageEmbed()
      .setTitle('Commandes disponibles')
      .setDescription('Voici les commandes proposées :')
      .addFields(
        Object.keys(botCommands).map(key => {
          return {
            name: `\`.${botCommands[key].name}\``,
            value: botCommands[key].description,
            inline: true
          };
        })
      )
      .setTimestamp()
      .setFooter('Pandisbot');
    msg.channel.send(embed);
  },
};