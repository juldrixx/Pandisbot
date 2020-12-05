'use strict';

const fs = require('fs');

const tmp_directory = __dirname.replace('utils', 'tmp');
const asset_directory = __dirname.replace('utils', 'assets');

if (!fs.existsSync(tmp_directory)) {
  fs.mkdir(tmp_directory, (err) => {
    if (err) throw err;
  });
}

function getTempFile(fileName) {
  return new Promise((resolve, reject) => {
    fs.readFile(`${tmp_directory}/${fileName}`, (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });
}

function writeTempFile(filename, content) {
  return new Promise((resolve, reject) => {
    fs.writeFile(`${tmp_directory}/${filename}`, content, (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });
}

function getAssetFile(fileName) {
  return require(`${asset_directory}/${fileName}`);
}

module.exports = {
  getTempFile,
  writeTempFile,
  getAssetFile,
}