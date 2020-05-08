'use strict';

require('dotenv').config();

const Discord = require('discord.js');
const bot = new Discord.Client();
bot.commands = new Discord.Collection();
const botCommands = require('./commands');
const { Utils, CronJobs } = require('./utils');

Object.keys(botCommands).map(key => {
  bot.commands.set(botCommands[key].name, botCommands[key]);
});

const TOKEN = 'NzA3OTk4NDAyNTgzMTk5Nzc1.XrRvug.xnKiCaZzh87dXYrotTLioV7mC1Y';

bot.login(TOKEN).catch(err => {
  console.log("Token " + TOKEN + " invalid.");
});

bot.on('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`);

  const launchAlmanax = () => bot.commands.get('!almanax').execute(Utils.getChannel(bot, 'dofus'), '');
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
});