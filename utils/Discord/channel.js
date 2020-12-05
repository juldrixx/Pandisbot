'use strict';

const FileManagerUtils = require("../fileManager");

function getChannel(bot, channelName) {
  const fileName = 'config.json';
  const config = FileManagerUtils.getAssetFile(fileName);
  return { channel: bot.channels.cache.get(config.channelsId[channelName]) };
}

module.exports = {
  getChannel
}