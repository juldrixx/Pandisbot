'user strict';

const FileManagerUtils = require('../fileManager.js');
const LeagueOfLegendsAPI = require('./api.js');
const LeagueOfLegendsRank = require('./rank.js');
const Constants = require('../Constants');
const { setRankInfosLocal } = require('./rank.js');

async function getLastGame(playerName) {
  const fileName = 'queueMappingLol.json';
  try {
    const summoner = await LeagueOfLegendsAPI.getSummoner(playerName);
    const summonerId = summoner.id;
    const accountId = summoner.accountId;

    const games = await LeagueOfLegendsAPI.getGameList(accountId);
    const lastGame = games[0];
    const lastGameId = lastGame.gameId;
    const championId = lastGame.champion;

    const gameInfo = await LeagueOfLegendsAPI.getGame(lastGameId);
    const gameVersion = gameInfo.gameVersion;
    const queueId = gameInfo.queueId;

    const participantId = gameInfo.participantIdentities.filter(p => p.player.accountId == accountId)[0].participantId;
    const { win, kills, deaths, assists } = gameInfo.participants.filter(p => p.participantId == participantId)[0].stats;

    const queueInfo = await LeagueOfLegendsAPI.getQueueInfo(queueId);
    const queueTypes = FileManagerUtils.getAssetFile(fileName);
    const queueType = queueTypes[queueId];

    const championImg = await LeagueOfLegendsAPI.getChampionThumbnail(gameVersion, championId);

    return {
      summonerName: playerName,
      summonerId,
      accountId,
      gameId: lastGameId,
      championImg,
      gameVersion,
      stats: {
        win,
        kills,
        deaths,
        assists
      },
      queueType,
      queueName: queueInfo.description
    };
  }
  catch (e) {
    throw new Error(e);
  }
}

async function getLastGameBySummonerId(summonerId) {
  const fileName = 'queueMappingLol.json';
  try {
    const summoner = await LeagueOfLegendsAPI.getSummonerBySummonerId(summonerId);
    const summonerName = summoner.name;
    const accountId = summoner.accountId;
    
    const games = await LeagueOfLegendsAPI.getGameList(accountId);
    const lastGame = games[0];
    const lastGameId = lastGame.gameId;
    const championId = lastGame.champion;

    const gameInfo = await LeagueOfLegendsAPI.getGame(lastGameId);
    const gameVersion = gameInfo.gameVersion;
    const queueId = gameInfo.queueId;

    const participantId = gameInfo.participantIdentities.filter(p => p.player.accountId == accountId)[0].participantId;
    const { win, kills, deaths, assists } = gameInfo.participants.filter(p => p.participantId == participantId)[0].stats;

    const queueInfo = await LeagueOfLegendsAPI.getQueueInfo(queueId);
    const queueTypes = FileManagerUtils.getAssetFile(fileName);
    const queueType = queueTypes[queueId];

    const championImg = await LeagueOfLegendsAPI.getChampionThumbnail(gameVersion, championId);

    return {
      summonerName,
      summonerId,
      accountId,
      gameId: lastGameId,
      championImg,
      gameVersion,
      stats: {
        win,
        kills,
        deaths,
        assists
      },
      queueType,
      queueName: queueInfo.description
    };
  }
  catch (e) {
    throw new Error(e);
  }
}

async function getLastGameLocal(summonerId) {
  const fileName = 'lastGamePlayer.json';
  try {
    const fileContent = await FileManagerUtils.getTempFile(fileName);
    const object = JSON.parse(fileContent);
    return object[summonerId];
  }
  catch (e) {
    return null;
  }
}

async function setLastGameLocal(summonerId, lastGameId) {
  const fileName = 'lastGamePlayer.json';
  let object = {};
  try {
    const fileContent = await FileManagerUtils.getTempFile(fileName);
    object = JSON.parse(fileContent);
  }
  catch (e) {
    object = {};
  }

  object[summonerId] = lastGameId;

  try {
    await FileManagerUtils.writeTempFile(fileName, JSON.stringify(object));
  }
  catch (e) {
    throw new Error(e);
  }
}

async function getUpdateFromLastGame(playerName) {
  const resultLastGame = await getLastGame(playerName);
  const resultRankInfos = await LeagueOfLegendsRank.getRankInfos(playerName);
  const resultRankInfo = resultRankInfos.filter(rankInfo => rankInfo.queueType === resultLastGame.queueType)[0];

  let queueChangement = '-';
  if (resultRankInfo) {
    const localRankInfos = await LeagueOfLegendsRank.getRankInfosLocal(resultLastGame.summonerId);
    const localRankInfo = (localRankInfos || []).filter(l => l.queueType === resultLastGame.queueType)[0];

    if (localRankInfo) {
      const lpDifference = resultRankInfo.leaguePoints - localRankInfo.leaguePoints;

      // PROMOTION
      if (Constants.TIER_ORDER.indexOf(resultRankInfo.tier) > Constants.TIER_ORDER.indexOf(localRankInfo.tier))
        queueChangement = `Promotion en ${resultRankInfo.tier} ${resultRankInfo.rank} (${resultRankInfo.leaguePoints} LP)`;
      else if (Constants.RANK_ORDER.indexOf(resultRankInfo.rank) > Constants.RANK_ORDER.indexOf(localRankInfo.rank))
        queueChangement = `Promotion en ${resultRankInfo.tier} ${resultRankInfo.rank} (${resultRankInfo.leaguePoints} LP)`;
      // RELÉGATION
      else if (Constants.TIER_ORDER.indexOf(resultRankInfo.tier) < Constants.TIER_ORDER.indexOf(localRankInfo.tier))
        queueChangement = `Relégation en ${resultRankInfo.tier} ${resultRankInfo.rank} (${resultRankInfo.leaguePoints} LP)`;
      else if (Constants.RANK_ORDER.indexOf(resultRankInfo.rank) < Constants.RANK_ORDER.indexOf(localRankInfo.rank))
        queueChangement = `Relégation en ${resultRankInfo.tier} ${resultRankInfo.rank} (${resultRankInfo.leaguePoints} LP)`;
      // PASSAGE EN BO
      else if (resultRankInfo.miniSeries && !localRankInfo.miniSeries)
        queueChangement = `${lpDifference > 0 ? '+' : '-'}${Math.abs(lpDifference)} LP (${resultRankInfo.tier} ${resultRankInfo.rank} - ${resultRankInfo.leaguePoints} LP) - Qualification en BO${resultRankInfo.miniSeries.target * 2 - 1}`;
      // PERTE DU BO
      else if (!resultRankInfo.miniSeries && localRankInfo.miniSeries)
        queueChangement = `${lpDifference > 0 ? '+' : '-'}${Math.abs(lpDifference)} LP (${resultRankInfo.tier} ${resultRankInfo.rank} - ${resultRankInfo.leaguePoints} LP) - Échec du BO${localRankInfo.miniSeries.target * 2 - 1}`;
      // MISE À JOUR DU BO
      else if (resultRankInfo.miniSeries && localRankInfo.miniSeries)
        queueChangement = `${resultRankInfo.miniSeries.progress.replace(/W/g, '✓').replace(/L/g, '✗').replace(/N/g, '-')} (${resultRankInfo.tier} ${resultRankInfo.rank} - ${resultRankInfo.leaguePoints} LP)`;
      // CHANGEMENT DE LP
      else
        queueChangement = `${lpDifference > 0 ? '+' : lpDifference < 0 ? '-' : ''}${Math.abs(lpDifference)} LP (${resultRankInfo.tier} ${resultRankInfo.rank} - ${resultRankInfo.leaguePoints} LP)`;
    }
    else if (resultRankInfo.miniSeries) {
      queueChangement = `${resultRankInfo.miniSeries.progress.replace(/W/g, '✓').replace(/L/g, '✗').replace(/N/g, '-')} (${resultRankInfo.tier} ${resultRankInfo.rank} - ${resultRankInfo.leaguePoints} LP)`;
    }
    else {
      queueChangement = `${resultRankInfo.tier} ${resultRankInfo.rank} - ${resultRankInfo.leaguePoints} LP`;
    }
  }

  await setRankInfosLocal(resultLastGame.summonerId, resultRankInfos);
  await setLastGameLocal(resultLastGame.summonerId, resultLastGame.gameId)

  return {
    stats: resultLastGame.stats,
    championImg: resultLastGame.championImg,
    queueName: resultLastGame.queueName,
    queueChangement
  };
}

module.exports = {
  getLastGame,
  getLastGameBySummonerId,
  getLastGameLocal,
  setLastGameLocal,
  getUpdateFromLastGame,
}