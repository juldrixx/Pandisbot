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

const TOKEN = process.env.TOKEN;

bot.login(TOKEN).catch(err => {
  console.log("Token " + TOKEN + " invalid.");
});

bot.on('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`);

  RiotApi.getChampionThumbnail('10.9.318.9', '45');
  const launchAlmanax = () => bot.commands.get('!almanax').execute(Utils.getChannel(bot, 'dofus-almanax'), '');
  CronJobs.scheduleCronEveryDay(0, 0, 0, launchAlmanax);
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