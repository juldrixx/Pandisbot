'use strict';

const { MessageEmbed } = require('discord.js');
const { DofusUtils } = require('../../utils');

module.exports = {
  name: 'almanax',
  description: 'Donne l\'almanax du jour actuel',
  execute(msg, args) {
    const call = async () => {
      const result = await DofusUtils.getCurrentAlmanax();
      const currentDate = (new Date()).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      const embed = new MessageEmbed()
        .setColor('#3269a8')
        .setTitle(currentDate[0].toUpperCase() + currentDate.slice(1))
        .setDescription(result.offering)
        .setThumbnail(DofusUtils.getObjectURL(result.objectID))
        .addField(result.bonusTitle, result.bonusDescription)
        .setTimestamp()
        .setFooter('Pandisbot');
      msg.channel.send(embed);
    }

    call().catch(err => {
      console.error(`Error: ${err}`);
      //msg.channel.send(`Une erreur s'est produite.`);
    });
  },
};