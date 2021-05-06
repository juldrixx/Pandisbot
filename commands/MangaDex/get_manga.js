'use strict';

const { MessageEmbed, MessageAttachment } = require('discord.js');
const { MangaDexUtils, FileManagerUtils } = require('../../utils');
const { decode } = require('html-entities');

module.exports = {
  name: 'manga',
  description: 'Permet de récupérer des informations sur un manga',
  arguments: 'manga_name',
  execute(msg, args) {
    const manga_name = args.join(' ');

    const call = async () => {
      const mangas = await MangaDexUtils.getMangaByTitle(manga_name);
      mangas.forEach(m => {
        const attachment = new MessageAttachment(FileManagerUtils.getIconPath('app', 'panda'), `image_${m.data.id}.png`);
        const embed = new MessageEmbed()
          .attachFiles(attachment)
          .setColor('#4ceaed')
          .setTitle(decode(m.data.attributes.title.en ?? m.data.attributes.title[Object.keys(m.data.attributes.title)[0]]))
          .setDescription(decode(m.data.attributes.description.fr ?? m.data.attributes.description[Object.keys(m.data.attributes.description)[0]].split('\r\n')[0]))
          .setThumbnail(`attachment://image_${m.data.id}.png`)
          .addField('Dernier chapitre', m.data.attributes.lastChapter.length > 0 ? m.data.attributes.lastChapter : 'N/A')
          .setTimestamp()
          .setFooter('Pandisbot');
        msg.channel.send(embed);
      });
    }

    call().catch(err => {
      console.error(`Error: ${err}`);
      msg.channel.send(`Une erreur s'est produite.`);
    });
  },
};