'use strict';

const config = require('../assets/config.json');

module.exports = {
    getChannel(bot, channelName) {
        return { channel: bot.channels.cache.get(config.channelsId[channelName]) };
    },
    getResultMatchLol(accountId, match) {
        const participantId = match.participantIdentities.filter(p => p.player.accountId == accountId)[0].participantId;
        return match.participants.filter(p => p.participantId == participantId)[0].stats.win;
    },
    getScoreMatchLol(accountId, match) {
        const participantId = match.participantIdentities.filter(p => p.player.accountId == accountId)[0].participantId;
        const stats = match.participants.filter(p => p.participantId == participantId)[0].stats;
        return `${stats.kills}/${stats.deaths}/${stats.assists}`;
    },
    getChampionThumbnail(accountId, match) {
        const participantId = match.participantIdentities.filter(p => p.player.accountId == accountId)[0].participantId;
        const stats = match.participants.filter(p => p.participantId == participantId)[0].stats;
        return `${stats.kills}/${stats.deaths}/${stats.assists}`;
    },
}