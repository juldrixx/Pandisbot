'user strict';

const FileManagerUtils = require('../fileManager.js');

async function getCurrentAlmanax() {
  const fileName = 'almanax.json';

  let almanaxCalender = {};
  try {
    almanaxCalender = FileManagerUtils.getAssetFile(fileName);
  }
  catch (e) {
    throw new Error(e);
  }

  const today = new Date();
  const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
  const currentDay = String(today.getDate()).padStart(2, '0');

  return almanaxCalender[currentMonth + '-' + currentDay];
}

function getObjectURL(objectID) {
  return `http://staticns.ankama.com/dofus/www/game/items/200/${objectID}.png`;
}

module.exports = {
  getCurrentAlmanax,
  getObjectURL,
}