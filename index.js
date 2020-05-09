'use strict';

require('dotenv').config();

const Discord = require('discord.js');
const bot = new Discord.Client();
bot.commands = new Discord.Collection();
const botCommands = require('./commands');
const { Utils, CronJobs, RiotApi } = require('./utils');

Object.keys(botCommands).map(key => {
  bot.commands.set(botCommands[key].name, botCommands[key]);
});

const TOKEN = process.env.TOKEN_DISCORD;

bot.login(TOKEN).catch(err => {
  console.log("Token " + TOKEN + " invalid.");
});

bot.on('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`);

  const launchAlmanax = () => bot.commands.get('!almanax').execute(Utils.getChannel(bot, 'dofus-almanax'), []);
  CronJobs.scheduleCronEveryDayAt(0, 0, 0, launchAlmanax);

  const launchTracking = () => {
    Utils.getLolTrackedPlayer().then((trackedPlayers) => {
      trackedPlayers.forEach(playerName =>{
        Utils.isLolNewLastGame(playerName).then(r => {
          Utils.updateLolLastGameTrackedPlayer(playerName, r).then(() => {
            bot.commands.get('!lol_last_game').execute(Utils.getChannel(bot, 'league-of-legends'), [playerName])
          }).catch(() => {});
        })
        .catch(() => {});
      });
    });
  };
  CronJobs.scheduleCronEveryXSeconds(5, launchTracking);
});

bot.on('message', msg => {
  const args = msg.content.split(/ +/);
  const command = args.shift().toLowerCase();

  if (!bot.commands.has(command)) return;

  try {
    bot.commands.get(command).execute(msg, args);
  } catch (error) {
    console.error(error);
    msg.reply('there was an error trying to execute that command!');
  }
  msg.delete();
});