'use strict';

const { MessageEmbed, MessageAttachment } = require('discord.js');
const { AmongUsUtils } = require('../../utils');

module.exports = {
  name: 'modifiers',
  description: 'Donne la descriptions des modifieurs AmongUs',
  execute(msg, args) {
    const call = async () => {
      const modifiers = AmongUsUtils.getModifiers();
      Object.keys(modifiers).forEach(k => {
        const modifier = modifiers[k];
        const attachment = new MessageAttachment(modifier.image, `image_${k}.png`);
        const embed = new MessageEmbed()
          .attachFiles(attachment)
          .setColor('#c28722')
          .setTitle(modifier.name.en + ` (${modifier.name.fr})`)
          .addField('Appiqué sur', modifier.appliedTo[0].charAt(0).toUpperCase() + modifier.appliedTo.slice(1))
          .setDescription(modifier.description)
          .setThumbnail(`attachment://image_${k}.png`)
          .setTimestamp()
          .setFooter('Pandisbot');

        msg.channel.send(embed);
      });
    }

    call().catch(err => {
      console.error(`Error: ${err}`);
    });
  },
};