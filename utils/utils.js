'use strict';

const config = require('../assets/config.json');

module.exports = {
    getChannel(bot, channelName) {
        return { channel: bot.channels.cache.get(config.channelsId[channelName]) };
    }
}