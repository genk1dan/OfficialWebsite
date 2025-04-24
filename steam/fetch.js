const fs = require('fs');
const axios = require('axios');

const appIds = ['1737340', '2812610', '2589500'];

async function fetchSteamData(appId) {
  const url = `https://store.steampowered.com/api/appdetails?appids=${appId}&l=schinese`;
  const { data } = await axios.get(url);
  const gameData = data[appId].data;

  return {
    appId,
    name: gameData.name,
    header_image: gameData.header_image,
    short_description: gameData.short_description,
    genres: gameData.genres?.map(g => g.description),
    recommendations: gameData.recommendations?.total ?? 0,
    positive_percentage: gameData.metacritic?.score ?? 'N/A',
    link: `https://store.steampowered.com/app/${appId}/`
  };
}

(async () => {
  const allGames = await Promise.all(appIds.map(fetchSteamData));
  fs.writeFileSync('steam/steamData.json', JSON.stringify(allGames, null, 2));
})();
