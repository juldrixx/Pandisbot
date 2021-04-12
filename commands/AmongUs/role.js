'use strict';

const { MessageEmbed, MessageAttachment } = require('discord.js');
const { AmongUsUtils } = require('../../utils');

module.exports = {
  name: 'role',
  description: 'Donne la descriptions d\'un rôles AmongUs',
  arguments: 'role_name',
  execute(msg, args) {
    const call = async () => {
      const roleName = args.join(' ');
      if (roleName.trim().length === 0) return;
      const role = AmongUsUtils.getRole(roleName);
      const attachment = new MessageAttachment(role.image, `image_${roleName}.png`);
      const teamColor = { crewmate: '#24a8be', impostor: '7a0838', neutral: '8394bf' };
      const embed = new MessageEmbed()
        .attachFiles(attachment)
        .setColor(teamColor[role.team])
        .setTitle(role.name.en + ` (${role.name.fr})`)
        .addField('Team', role.team[0].charAt(0).toUpperCase() + role.team.slice(1))
        .setDescription(role.description)
        .setThumbnail(`attachment://image_${roleName}.png`)
        .setTimestamp()
        .setFooter('Pandisbot');

      msg.channel.send(embed);
    }

    call().catch(err => {
      console.error(`Error: ${err}`);
    });
  },
};