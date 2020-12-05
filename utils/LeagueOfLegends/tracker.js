'user strict';

const FileManagerUtils = require('../fileManager.js');
const LeagueOfLegendsAPI = require('./api.js');
const LeagueOfLegendsRank = require('./rank.js');
const LeagueOfLegendsLastGame = require('./last_game.js');

async function getTrackedPlayer() {
  const fileName = 'trackedPlayer.json';
  try {
    const fileContent = await FileManagerUtils.getTempFile(fileName);
    return JSON.parse(fileContent);
  }
  catch (e) {
    return [];
  }
}

async function setTrackedPlayer(trackedPlayer) {
  const fileName = 'trackedPlayer.json';
  try {
    await FileManagerUtils.writeTempFile(fileName, trackedPlayer);
  }
  catch (e) {
    throw new Error(e);
  }
}

async function trackPlayer(playerName) {
  let trackedPlayer = await getTrackedPlayer();
  let summonerId = null;

  try {
    const summoner = await LeagueOfLegendsAPI.getSummoner(playerName);
    summonerId = summoner.id;
  }
  catch (e) {
    return `Le joueur **${playerName}** n'existe pas.`;
  }

  if (trackedPlayer.includes(summonerId)) return `Le joueur **${playerName}** est déjà suivi.`;

  trackedPlayer.push(summonerId);

  try {
    const rankInfos = await LeagueOfLegendsAPI.getRankInfo(summonerId);
    await LeagueOfLegendsRank.setRankInfosLocal(summonerId, rankInfos);
  }
  catch (e) {
    throw new Error(e);
  }

  try {
    const lastGameInfo = await LeagueOfLegendsLastGame.getLastGame(playerName);
    const rankInfos = await LeagueOfLegendsRank.getRankInfos(playerName);
    await LeagueOfLegendsLastGame.setLastGameLocal(summonerId, lastGameInfo.gameId);
    await LeagueOfLegendsRank.setRankInfosLocal(summonerId, rankInfos);
  }
  catch (e) {
    throw new Error(e);
  }

  try {
    await FileManagerUtils.writeTempFile(fileName, JSON.stringify(trackedPlayer));
    return `Le joueur **${playerName}** est maintenant suivi.`;
  }
  catch (e) {
    throw new Error(e);
  }
}

async function untrackPlayer(playerName) {
  let trackedPlayer = await getTrackedPlayer();
  if (trackedPlayer.length === 0) return `Le joueur **${playerName}** n'est pas suivi.`;

  let summonerId = null;
  try {
    const summoner = await LeagueOfLegendsAPI.getSummoner(playerName);
    summonerId = summoner.id;
  }
  catch (e) {
    return `Le joueur **${playerName}** n'existe pas.`;
  }

  if (!trackedPlayer.includes(summonerId)) return `Le joueur **${playerName}** n'est pas suivi.`;

  trackedPlayer.splice(trackedPlayer.indexOf(summonerId), 1);

  try {
    await setTrackedPlayer(JSON.stringify(trackedPlayer));
    return `Le joueur **${playerName}** n'est maintenant plus suivi.`;
  }
  catch (e) {
    throw new Error(e);
  }
}

module.exports = {
  getTrackedPlayer,
  setTrackedPlayer,
  trackPlayer,
  untrackPlayer,
}