'use strict';

require('dotenv').config();
const fetch = require('node-fetch');

const url_api = 'https://euw1.api.riotgames.com/';
const API_KEY = 'RGAPI-67893d5b-7809-4c62-8faf-86c2d35f6c91'; // process.env.API_KEY_RIOT;

const url_ddragon_version = 'https://ddragon.leagueoflegends.com/api/versions.json';
const url_ddragon = 'http://ddragon.leagueoflegends.com/cdn/';

module.exports = {
    getAccountId(accountName) {
        return new Promise((resolve, reject) => {
            fetch(url_api + `lol/summoner/v4/summoners/by-name/${accountName}?api_key=${API_KEY}`)
                .then((result) => result.json())
                .then((result) => {
                    resolve(result.accountId);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    },
    getMatchList(accountId) {
        return new Promise((resolve, reject) => {
            fetch(url_api + `lol/match/v4/matchlists/by-account/${accountId}?api_key=${API_KEY}`)
                .then((result) => result.json())
                .then((result) => {
                    resolve(result.matches);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    },
    getMatch(gameId) {
        return new Promise((resolve, reject) => {
            fetch(url_api + `lol/match/v4/matches/${gameId}?api_key=${API_KEY}`)
                .then((result) => result.json())
                .then((result) => {
                    resolve(result);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    },
    getChampionThumbnail(gameVersion, championId) {
        return new Promise((resolve, reject) => {
            const version_sup = gameVersion.split('.')[0];
            const version_inf = gameVersion.split('.')[1];

            fetch(url_ddragon_version)
                .then((result) => result.json())
                .then((versions) => {
                    let version = versions.filter(v => {
                        const splits = v.split('.');
                        return splits.length >= 2 && splits[0] == version_sup && splits[1] == version_inf;
                    })[0];

                    if (!version) {
                        version = versions[0];
                    }

                    fetch(url_ddragon + `${version}/data/fr_FR/champion.json`)
                        .then((result) => result.json())
                        .then((champions) => {
                            const champion = Object.values(champions.data).filter((champion) => {
                                return champion.key == championId;
                            })[0];

                            resolve(url_ddragon + `${version}/img/champion/${champion.image.full}`);
                        })
                        .catch((err) => {
                            reject(err);
                        });
                })
                .catch((err) => {
                    reject(err);
                });

        });
    }
}