'use strict';

const { MessageEmbed, MessageAttachment } = require('discord.js');
const { AmongUsUtils } = require('../../utils');

module.exports = {
  name: 'roles',
  description: 'Donne la descriptions des rôles AmongUs',
  execute(msg, args) {
    const call = async () => {
      const roles = AmongUsUtils.getRoles();
      Object.keys(roles).forEach(k => {
        const role = roles[k];
        const attachment = new MessageAttachment(role.image, `image_${k}.png`);
        const teamColor = {crewmate: '#24a8be', impostor: '7a0838', neutral: '8394bf'};
        const embed = new MessageEmbed()
          .attachFiles(attachment)
          .setColor(teamColor[role.team])
          .setTitle(role.name.en + ` (${role.name.fr})`)
          .addField('Team', role.team[0].charAt(0).toUpperCase() + role.team.slice(1))
          .setDescription(role.description)
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