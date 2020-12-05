'use strict';

require('dotenv').config();
const fetch = require('node-fetch');

const url_api = 'https://euw1.api.riotgames.com/';
const API_KEY = process.env.API_KEY_RIOT;

const url_ddragon_version = 'https://ddragon.leagueoflegends.com/api/versions.json';
const url_ddragon = 'http://ddragon.leagueoflegends.com/cdn/';

const queue_url = 'http://static.developer.riotgames.com/docs/lol/queues.json';

function getSummoner(summonerName) {
  return new Promise((resolve, reject) => {
    fetch(encodeURI(url_api + `lol/summoner/v4/summoners/by-name/${summonerName}?api_key=${API_KEY}`))
      .then(result => {
        if (result.status >= 400) reject(result.statusText);
        return result.json();
      })
      .then(result => {
        resolve(result);
      })
      .catch(err => {
        reject(err);
      });
  });
}

function getSummonerBySummonerId(summonerId) {
  return new Promise((resolve, reject) => {
    fetch(encodeURI(url_api + `lol/summoner/v4/summoners/${summonerId}?api_key=${API_KEY}`))
      .then(result => {
        if (result.status >= 400) reject(result.statusText);
        return result.json();
      })
      .then(result => {
        resolve(result);
      })
      .catch(err => {
        reject(err);
      });
  });
}

function getGameList(accountId) {
  return new Promise((resolve, reject) => {
    fetch(encodeURI(url_api + `lol/match/v4/matchlists/by-account/${accountId}?api_key=${API_KEY}`))
      .then(result => {
        if (result.status >= 400) reject(result.statusText);
        return result.json();
      })
      .then(result => {
        resolve(result.matches);
      })
      .catch(err => {
        reject(err);
      });
  });
}

function getGame(gameId) {
  return new Promise((resolve, reject) => {
    fetch(encodeURI(url_api + `lol/match/v4/matches/${gameId}?api_key=${API_KEY}`))
      .then(result => {
        if (result.status >= 400) reject(result.statusText);
        return result.json();
      })
      .then(result => {
        resolve(result);
      })
      .catch(err => {
        reject(err);
      });
  });
}

function getQueueInfo(queueId) {
  return new Promise((resolve, reject) => {
    fetch(queue_url)
      .then(result => {
        if (result.status >= 400) reject(result.statusText);
        return result.json();
      })
      .then(queues => {
        resolve(queues.filter(queue => queue.queueId === queueId)[0]);
      })
      .catch(err => {
        reject(err);
      });
  });
}

function getRankInfo(summonerId) {
  return new Promise((resolve, reject) => {
    fetch(encodeURI(url_api + `lol/league/v4/entries/by-summoner/${summonerId}?api_key=${API_KEY}`))
      .then((result) => {
        if (result.status >= 400) reject(result.statusText);
        return result.json();
      })
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

function getChampionThumbnail(gameVersion, championId) {
  return new Promise((resolve, reject) => {
    const version_sup = gameVersion.split('.')[0];
    const version_inf = gameVersion.split('.')[1];

    fetch(url_ddragon_version)
      .then(result => {
        if (result.status >= 400) reject(result.statusText);
        return result.json();
      })
      .then(versions => {
        let version = versions.filter(v => {
          const splits = v.split('.');
          return splits.length >= 2 && splits[0] == version_sup && splits[1] == version_inf;
        })[0];

        if (!version) {
          version = versions[0];
        }

        fetch(encodeURI(url_ddragon + `${version}/data/fr_FR/champion.json`))
          .then(result => {
            if (result.status >= 400) reject(result.statusText);
            return result.json();
          })
          .then(champions => {
            const champion = Object.values(champions.data).filter((champion) => {
              return champion.key == championId;
            })[0];

            resolve(url_ddragon + `${version}/img/champion/${champion.image.full}`);
          })
          .catch(err => {
            reject(err);
          });
      })
      .catch(err => {
        reject(err);
      });
  });
}

module.exports = {
  getSummoner,
  getSummonerBySummonerId,
  getGameList,
  getGame,
  getQueueInfo,
  getRankInfo,
  getChampionThumbnail,
}