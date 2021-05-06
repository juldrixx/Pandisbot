const fetch = require('node-fetch');

const url_api = 'https://api.mangadex.org/';

function formatParams(params) {
  return Object.entries(params).map(([k, v]) => `${k}=${v}`).join('&');
}

function getManga(params) {
  return new Promise((resolve, reject) => {
    console.log(encodeURI(url_api + `manga${params ? `?${formatParams(params)}` : ''}`))
    fetch(encodeURI(url_api + `manga${params ? `?${formatParams(params)}` : ''}`))
      .then(result => {
        if (result.status >= 400) reject(result.statusText);
        else if (result.status === 204) return resolve({results: []});
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

module.exports = {
  getManga,
}