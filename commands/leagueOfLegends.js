'use strict';

const { MessageEmbed } = require('discord.js');
const { Utils, RiotApi } = require('../utils');

module.exports = {
    name: '!lol_last_game',
    description: 'Get the last game of Legend Of Legends result!',
    execute(msg, args) {
        args.forEach(playerName => {
            RiotApi.getAccountId(playerName)
                .then((accountId) => {
                    RiotApi.getMatchList(accountId)
                        .then((matches) => {
                            const lastMatchId = matches[0].gameId;
                            const championId = matches[0].champion;
                            RiotApi.getMatch(lastMatchId)
                                .then((match) => {
                                    const gameVersion = match.gameVersion;
                                    const resultMatch = Utils.getResultMatchLol(accountId, match);
                                    const scroreMatch = Utils.getScoreMatchLol(accountId, match);
                                    RiotApi.getChampionThumbnail(gameVersion, championId)
                                        .then((champion_img) => {
                                            const embed = new MessageEmbed()
                                                .setColor('#0099ff')
                                                .setTitle(`${resultMatch ? 'Victoire' : 'Défaite'} pour ${playerName} !`)
                                                .setDescription(`Score : ${scroreMatch}`)
                                                .setThumbnail(champion_img)
                                                .setTimestamp()
                                                .setFooter('Pandisbot');
                                            msg.channel.send(embed);
                                        })
                                        .catch((e) => console.log(e));
                                })
                                .catch((e) => console.log(e));
                        })
                        .catch((e) => console.log(e));
                })
                .catch((e) => console.log(e));
        });
    },
};