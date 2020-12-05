'use strict';

require('dotenv').config();

const Discord = require('discord.js');
const bot = new Discord.Client();
bot.commands = new Discord.Collection();
const botCommands = require('./commands');
const { DiscordUtils, CronJobUtils, LeagueOfLegendsUtils } = require('./utils');

Object.keys(botCommands).forEach(key => {
  const botCommand = { ...botCommands[key] };
  if (botCommand.availableCommands) {
    const subCommands = new Discord.Collection();
    Object.keys(botCommand.availableCommands).forEach(subKey => {
      subCommands.set(botCommand.availableCommands[subKey].name, botCommand.availableCommands[subKey]);
    });
    botCommand.availableCommands = subCommands;
  }
  bot.commands.set(`.${botCommand.name}`, botCommand);
});

const TOKEN = process.env.TOKEN_DISCORD;

bot.login(TOKEN).catch(err => {
  console.log("Token " + TOKEN + " invalid.");
});

bot.on('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`);

  const launchAlmanax = () => botCommands.Dofus.availableCommands.Almanax.execute(DiscordUtils.getChannel(bot, 'dofus-almanax'));
  CronJobUtils.scheduleCronEveryDayAt(0, 0, 0, launchAlmanax);

  const launchTracking = async () => {
    try {
      const trackedPlayers = await LeagueOfLegendsUtils.getTrackedPlayer();

      await Promise.all(trackedPlayers.map(async (summonerId) => {
        const lastGame = await LeagueOfLegendsUtils.getLastGameBySummonerId(summonerId);
        const lastGameLocalId = await LeagueOfLegendsUtils.getLastGameLocal(summonerId);

        if (lastGame.gameId !== lastGameLocalId)
          botCommands.LeagueOfLegends.availableCommands.LastGame.execute(DiscordUtils.getChannel(bot, 'league-of-legends'), [lastGame.summonerName]);
      }));
    }
    catch (e) {
      console.error(e);
    }
  };
  CronJobUtils.scheduleCronEveryXSeconds(30, launchTracking);
});

function processInput(msg, args, availableCommands, parentCommand = null) {
  const commandName = args.length > 0 ? args.shift().toLowerCase() : null;

  if (!availableCommands.has(commandName) && !parentCommand) return;

  if (!commandName || !availableCommands.has(commandName)) {
    const embed = new Discord.MessageEmbed()
      .setTitle(`Commandes disponible avec \`${parentCommand}\``)
      .setDescription('Voici les commandes proposées :')
      .addFields(
        Array.from(availableCommands.keys()).map(key => {
          const command = availableCommands.get(key);
          return {
            name: `${key} \`${parentCommand} ${key}\``,
            value: command.description,
            inline: true
          };
        })
      )
      .setTimestamp()
      .setFooter('Pandisbot');
    msg.channel.send(embed);
  }
  else {
    const command = availableCommands.get(commandName);
    if (command.execute) {
      try {
        command.execute(msg, args);
      } catch (error) {
        console.error(`Error: ${error}`);
        msg.reply('il y a une erreur pendant l\'exécution de la commande.');
      }
    }
    else {
      return processInput(msg, args, command.availableCommands, commandName);
    }
  }

  msg.delete();
}


bot.on('message', msg => {
  return processInput(msg, msg.content.split(/ +/), bot.commands);
});