'user strict';

const MangaDexAPI = require('./api.js');

async function getMangaByTitle(title) {
  const result = [];
  const limit = 100;
  let offset = 0;
  let total = -1;

  try {
    do {
      const mangas = await MangaDexAPI.getManga({
        title,
        limit,
        offset,
      });

      total = mangas.total;
      offset += 1;
      result.push(...mangas.results);
    } while(offset  * limit < total);
    
    return result;
  }
  catch (e) {
    throw new Error(e);
  }
}


module.exports = {
  getMangaByTitle,
}