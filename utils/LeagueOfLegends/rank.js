'user strict';

const FileManagerUtils = require('../fileManager.js');
const LeagueOfLegendsAPI = require('./api.js');

async function getRankInfos(playerName) {
  try {
    const summoner = await LeagueOfLegendsAPI.getSummoner(playerName);
    const summonerId = summoner.id;

    return await LeagueOfLegendsAPI.getRankInfo(summonerId);
  }
  catch (e) {
    throw new Error(e);
  }
}

async function getRankInfo(playerName, queueType) {
  try {
    const rankInfos = await getRankInfos(playerName);
    return rankInfos.filter(rankInfo => rankInfo.queueType === queueType)[0];
  }
  catch (e) {
    throw new Error(e);
  }
}

async function getRankInfosLocal(summonerId) {
  const fileName = 'rankInfoPlayer.json';
  try {
    const fileContent = await FileManagerUtils.getTempFile(fileName);
    const object = JSON.parse(fileContent);
    return object[summonerId];
  }
  catch (e) {
    return null;
  }
}

async function setRankInfosLocal(summonerId, rankInfos) {
  const fileName = 'rankInfoPlayer.json';
  let object = {};
  try {
    const fileContent = await FileManagerUtils.getTempFile(fileName);
    object = JSON.parse(fileContent);
  }
  catch (e) {
    object = {};
  }

  object[summonerId] = rankInfos;

  try {
    await FileManagerUtils.writeTempFile(fileName, JSON.stringify(object));
  }
  catch (e) {
    throw new Error(e);
  }
}

module.exports = {
  getRankInfos,
  getRankInfo,
  getRankInfosLocal,
  setRankInfosLocal,
}