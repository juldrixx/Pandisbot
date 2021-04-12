'use strict';

const { MessageEmbed, MessageAttachment } = require('discord.js');
const { AmongUsUtils } = require('../../utils');

module.exports = {
  name: 'modifier',
  description: 'Donne la descriptions d\'un modifieur AmongUs',
  arguments: 'modifier_name',
  execute(msg, args) {
    const call = async () => {
      const modifierName = args.join(' ');
      if (modifierName.trim().length === 0) return;
      const modifier = AmongUsUtils.getModifier(modifierName);
      const attachment = new MessageAttachment(modifier.image, `image_${modifierName}.png`);
      const embed = new MessageEmbed()
        .attachFiles(attachment)
        .setColor('#c28722')
        .setTitle(modifier.name.en + ` (${modifier.name.fr})`)
        .addField('Appiqué sur', modifier.appliedTo[0].charAt(0).toUpperCase() + modifier.appliedTo.slice(1))
        .setDescription(modifier.description)
        .setThumbnail(`attachment://image_${modifierName}.png`)
        .setTimestamp()
        .setFooter('Pandisbot');

      msg.channel.send(embed);
    }

    call().catch(err => {
      console.error(`Error: ${err}`);
    });
  },
};