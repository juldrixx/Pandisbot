'use strict';

const config = require('../assets/config.json');
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

function getLolAccountId(playerName) {
  return new Promise((resolve, reject) => {
    RiotApi.getAccountId(playerName)
      .then((accountId) => {
        resolve(accountId);
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
    getLolAccountId(playerName)
      .then((accountId) => {
        getLolLastGame(accountId)
          .then((match) => {
            const lastMatchId = match.gameId;
            const championId = match.champion;
            RiotApi.getMatch(lastMatchId)
              .then((match) => {
                const gameVersion = match.gameVersion;
                const gameType = math.gameType;
                const resultMatch = getResultMatchLol(accountId, match);
                const scoreMatch = getScoreMatchLol(accountId, match);
                RiotApi.getChampionThumbnail(gameVersion, championId)
                  .then((championImg) => {
                    resolve({
                      resultMatch,
                      scoreMatch,
                      championImg,
                      gameType
                    });
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
        getLolAccountId(playerName)
          .then((accountId) => {
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

module.exports = {
  getChannel,
  getResultMatchLol,
  getScoreMatchLol,
  getChampionThumbnail,
  getLolTrackedPlayer,
  writeLolTrackerPlayer,
  getLolAccountId,
  getLolLastGame,
  getLolLastGameInfo,
  getLolLastGameTrackedPlayer,
  isLolNewLastGame,
  updateLolLastGameTrackedPlayer,
  getRankInfoTrackedPlayer,
}