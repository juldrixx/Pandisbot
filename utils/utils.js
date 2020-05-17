'use strict';

const config = require('../assets/config.json');
const queueMappingLol = require('../assets/queueMappingLol.json');
const fs = require('fs');
const RiotApi = require('./riotApi');

const tmp_directory = __dirname.replace('utils', 'tmp');

if (!fs.existsSync(tmp_directory)) {
  fs.mkdir(tmp_directory, (err) => {
    if (err) throw err;
  });
}

function getChannel(bot, channelName) {
  return { channel: bot.channels.cache.get(config.channelsId[channelName]) };
}

function getResultMatchLol(accountId, match) {
  const participantId = match.participantIdentities.filter(p => p.player.accountId == accountId)[0].participantId;
  return match.participants.filter(p => p.participantId == participantId)[0].stats.win;
}

function getScoreMatchLol(accountId, match) {
  const participantId = match.participantIdentities.filter(p => p.player.accountId == accountId)[0].participantId;
  const stats = match.participants.filter(p => p.participantId == participantId)[0].stats;
  return `${stats.kills}/${stats.deaths}/${stats.assists}`;
}

function getChampionThumbnail(accountId, match) {
  const participantId = match.participantIdentities.filter(p => p.player.accountId == accountId)[0].participantId;
  const stats = match.participants.filter(p => p.participantId == participantId)[0].stats;
  return `${stats.kills}/${stats.deaths}/${stats.assists}`;
}

function getLolTrackedPlayer() {
  return new Promise((resolve, _) => {
    fs.readFile(`${tmp_directory}/trackedPlayer.json`, (err, data) => {
      if (err) data = "[]";
      resolve(JSON.parse(data));
    });
  });
}

function writeLolTrackerPlayer(trackedPlayer) {
  return new Promise((resolve, reject) => {
    fs.writeFile(`${tmp_directory}/trackedPlayer.json`, JSON.stringify(trackedPlayer), (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });
}

function getLolSummoner(playerName) {
  return new Promise((resolve, reject) => {
    RiotApi.getSummoner(playerName)
      .then((summoner) => {
        resolve(summoner);
      })
      .catch((e) => reject(e));
  });
}

function getLolLastGame(accountId) {
  return new Promise((resolve, reject) => {
    RiotApi.getMatchList(accountId)
      .then((matches) => {
        resolve(matches[0]);
      })
      .catch((e) => reject(e));
  });
}

function getLolLastGameInfo(playerName) {
  return new Promise((resolve, reject) => {
    getLolSummoner(playerName)
      .then((summoner) => {
        const accountId = summoner.accountId;
        const encryptedSummonerId = summoner.id;
        getLolLastGame(accountId)
          .then((match) => {
            const lastMatchId = match.gameId;
            const championId = match.champion;
            RiotApi.getMatch(lastMatchId)
              .then((match) => {
                const gameVersion = match.gameVersion;
                const queueId = match.queueId;
                const resultMatch = getResultMatchLol(accountId, match);
                const scoreMatch = getScoreMatchLol(accountId, match);
                RiotApi.getQueueInfo(queueId)
                  .then((queueInfo) => {
                    getRankedQueueUpdates(encryptedSummonerId, queueId)
                      .then((whatIsUpdate) => {
                        RiotApi.getChampionThumbnail(gameVersion, championId)
                          .then((championImg) => {
                            resolve({
                              resultMatch,
                              scoreMatch,
                              championImg,
                              queueInfo,
                              whatIsUpdate
                            });
                          })
                          .catch((e) => reject(e));
                      })
                      .catch((e) => reject(e));
                  })
                  .catch((e) => reject(e));
              })
              .catch((e) => reject(e));
          })
          .catch((e) => reject(e));
      })
      .catch((e) => reject(e));
  });
}

function getLolLastGameTrackedPlayer() {
  return new Promise((resolve, _) => {
    fs.readFile(`${tmp_directory}/lastGameTrackedPlayer.json`, (err, data) => {
      if (err) data = "{}";
      resolve(JSON.parse(data));
    });
  });
}

function isLolNewLastGame(playerName) {
  return new Promise((resolve, reject) => {
    getLolLastGameTrackedPlayer()
      .then((lastGames) => {
        getLolSummoner(playerName)
          .then((summoner) => {
            const accountId = summoner.accountId;
            getLolLastGame(accountId)
              .then((match) => {
                lastGames[playerName] != match.gameId ? resolve(match.gameId) : reject()
              })
              .catch((e) => reject(e));
          })
          .catch((e) => reject(e));
      });

  });
}

function updateLolLastGameTrackedPlayer(playerName, gameId) {
  return new Promise((resolve, reject) => {
    getLolLastGameTrackedPlayer()
      .then((lastGames) => {
        lastGames[playerName] = gameId;
        fs.writeFile(`${tmp_directory}/lastGameTrackedPlayer.json`, JSON.stringify(lastGames), (err, data) => {
          if (err) reject(err);
          resolve(data);
        });
      })
      .catch((e) => reject(e));
  });
}

function getRankInfoTrackedPlayer() {
  return new Promise((resolve, _) => {
    fs.readFile(`${tmp_directory}/rankInfoTrackedPlayer.json`, (err, data) => {
      if (err) data = "{}";
      resolve(JSON.parse(data));
    });
  });
}

function getRankedQueueUpdates(encryptedSummonerId, queueId) {
  return new Promise((resolve, reject) => {
    const queueType = getQueueType(queueId);
    let whatIsUpdate = '-';

    if (!queueType) return resolve(whatIsUpdate);
    RiotApi.getRankInfo(encryptedSummonerId)
      .then((rankInfos) => {
        const rankInfo = rankInfos.filter(rankInfo => rankInfo.queueType === queueType)[0];
        getRankInfoTrackedPlayer()
          .then(rankInfoTrackedPlayers => {
            const info = {
              tier: rankInfo.tier,
              rank: rankInfo.rank,
              leaguePoints: rankInfo.leaguePoints,
              wins: rankInfo.wins,
              losses: rankInfo.losses,
              miniSeries: rankInfo.miniSeries,
            };

            if (!rankInfoTrackedPlayers[encryptedSummonerId]) {
              rankInfoTrackedPlayers[encryptedSummonerId] = {};
            }

            if (!rankInfoTrackedPlayers[encryptedSummonerId][queueType]) {
              rankInfoTrackedPlayers[encryptedSummonerId][queueType] = info;
            }
            else {
              const rankInfoTrackedPlayer = rankInfoTrackedPlayers[encryptedSummonerId][queueType];
              const diff = info.leaguePoints - rankInfoTrackedPlayer.leaguePoints;

              if (info.tier === rankInfoTrackedPlayer.tier && info.rank === rankInfoTrackedPlayer.rank) {
                if (info.leaguePoints < 100) {
                  if (rankInfoTrackedPlayer.leaguePoints < 100) {
                    whatIsUpdate = `${diff >= 0 ? '+' : '-'}${Math.abs(diff)} LP (${info.tier} ${info.rank} - ${info.leaguePoints} LP)`;
                  }
                  else {
                    whatIsUpdate = `${diff >= 0 ? '+' : '-'}${Math.abs(diff)} LP (${info.tier} ${info.rank} - ${info.leaguePoints} LP) - Échec du BO${rankInfoTrackedPlayer.miniSeries.target * 2 - 1}`;
                  }
                }
                else {
                  if (rankInfoTrackedPlayer.leaguePoints < 100) {
                    whatIsUpdate = `${diff >= 0 ? '+' : '-'}${Math.abs(diff)} LP (${info.tier} ${info.rank} - ${info.leaguePoints} LP) - Qualifié en BO${info.miniSeries.target * 2 - 1}`;
                  }
                  else {
                    whatIsUpdate = `${info.miniSeries.progress.replace(/W/g, '✓').replace(/L/g, '✗').replace(/N/g, '.')} (${info.tier} ${info.rank} ${info.leaguePoints})`;
                  }
                }
              }
              else {
                if (info.leaguePoints < 100) {
                  if (rankInfoTrackedPlayer.leaguePoints < 100) {
                    whatIsUpdate = `Relégation en ${info.tier} ${info.rank} (${info.leaguePoints} LP)`;
                  }
                  else {
                    whatIsUpdate = `Promotion en ${info.tier} ${info.rank} (${info.leaguePoints} LP)`;
                  }
                }
                else {
                  if (rankInfoTrackedPlayer.leaguePoints < 100) {
                    whatIsUpdate = `Promotion en ${info.tier} ${info.rank} (${info.leaguePoints} LP)`;
                  }
                  else {
                    whatIsUpdate = `Promotion en ${info.tier} ${info.rank} et Qualifié en BO${info.miniSeries.target * 2 - 1}`;
                  }
                }
              }

              rankInfoTrackedPlayers[encryptedSummonerId][queueType] = info;
            }
            updateRankInfoTrackedPlayer(rankInfoTrackedPlayers).then(_ => resolve(whatIsUpdate)).catch(err => reject(err));
          })
          .catch((e) => reject(e));
      })
      .catch((e) => reject(e));
  });
}

function updateRankInfoTrackedPlayer(rankInfoTrackedPlayers) {
  return new Promise((resolve, _) => {
    fs.writeFile(`${tmp_directory}/rankInfoTrackedPlayer.json`, JSON.stringify(rankInfoTrackedPlayers), (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });
}

function getQueueType(queueId) {
  return queueMappingLol[queueId];
}

function initRankInfoTrackedPlayer() {
  return new Promise((resolve, reject) => {
    getRankInfoTrackedPlayer()
      .then(rankInfoTrackedPlayers => {
        getLolTrackedPlayer().then((trackedPlayers) => {
          trackedPlayers.forEach(playerName => {
            getLolSummoner(playerName)
              .then((summoner) => {
                const encryptedSummonerId = summoner.id;
                RiotApi.getRankInfo(encryptedSummonerId)
                  .then((rankInfos) => {
                    rankInfos.forEach(rankInfo => {
                      const info = {
                        tier: rankInfo.tier,
                        rank: rankInfo.rank,
                        leaguePoints: rankInfo.leaguePoints,
                        wins: rankInfo.wins,
                        losses: rankInfo.losses,
                        miniSeries: rankInfo.miniSeries,
                      };

                      if (!rankInfoTrackedPlayers[encryptedSummonerId]) {
                        rankInfoTrackedPlayers[encryptedSummonerId] = {};
                      }
                      if (!rankInfoTrackedPlayers[encryptedSummonerId][rankInfo.queueType]) {
                        rankInfoTrackedPlayers[encryptedSummonerId][rankInfo.queueType] = info;
                      }
                    });
                    updateRankInfoTrackedPlayer(rankInfoTrackedPlayers).then(_ => resolve(rankInfoTrackedPlayers)).catch(err => reject(err))
                  })
                  .catch((e) => reject(e));
              })
              .catch((e) => reject(e));
          });
        });
      })
      .catch((e) => reject(e));
  });
}

module.exports = {
  getChannel,
  getResultMatchLol,
  getScoreMatchLol,
  getChampionThumbnail,
  getLolTrackedPlayer,
  writeLolTrackerPlayer,
  getLolSummoner,
  getLolLastGame,
  getLolLastGameInfo,
  getLolLastGameTrackedPlayer,
  isLolNewLastGame,
  updateLolLastGameTrackedPlayer,
  getRankInfoTrackedPlayer,
  getRankedQueueUpdates,
  updateRankInfoTrackedPlayer,
  getQueueType,
  initRankInfoTrackedPlayer,
}