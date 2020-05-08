'use strict';

const fs = require('fs');
const { MessageEmbed } = require('discord.js');
const picture_url = 'http://staticns.ankama.com/dofus/www/game/items/200/$item.png';
const date_options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Europe/Paris' };

module.exports = {
  name: '!almanax',
  description: 'Get the current almanax!',
  execute(msg, args) {
    fs.readFile('./utils/almanax.json', (err, data) => {
      if (err) throw err;
      let alamanax = JSON.parse(data);
      
      let today = new Date();
      let current_date = today.toLocaleDateString('fr-FR', date_options);
      let dd = String(today.getDate()).padStart(2, '0');
      let mm = String(today.getMonth() + 1).padStart(2, '0');

      let current_almanax = alamanax[mm + '-' + dd];
      if (current_almanax) {
        const embed = new MessageEmbed()
          .setColor('#0099ff')
          .setTitle(current_date[0].toUpperCase() + current_date.slice(1))
          .setDescription(current_almanax.offering)
          .setThumbnail(picture_url.replace('$item', current_almanax.objectID))
          .addField(current_almanax.bonusTitle, current_almanax.bonusDescription)
          .setTimestamp()
          .setFooter('Pandisbot',);
        msg.channel.send(embed);
      }
      else {
        msg.channel.send('Wow!! This day isn\'t our database, that\'s weird!');
      }
    });
  },
};