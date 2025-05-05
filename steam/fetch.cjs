const fs = require('fs');
const axios = require('axios');


const appIds = ['1737340', '2812610', '2589500'];

async function fetchSteamData(appId) {
  const detailUrl = `https://store.steampowered.com/api/appdetails?appids=${appId}&l=schinese`;
  const reviewUrl = `https://store.steampowered.com/appreviews/${appId}?json=1&language=all&purchase_type=all`;

  const [detailRes, reviewRes] = await Promise.all([
    axios.get(detailUrl),
    axios.get(reviewUrl),
  ]);

  const gameData = detailRes.data[appId].data;
  const reviewData = reviewRes.data;

  const total = reviewData.query_summary?.total_reviews ?? 0;
  const positive = reviewData.query_summary?.total_positive ?? 0;
  const percentage = total > 0 ? Math.round((positive / total) * 100) : null;

  return {
    appId,
    name: gameData.name,
    header_image: gameData.header_image,
    short_description: gameData.short_description,
    genres: gameData.genres?.map(g => g.description),
    recommendations: gameData.recommendations?.total ?? 0,
    positive_percentage: percentage,  // ✅ 用真实用户评价计算
    link: `https://store.steampowered.com/app/${appId}/`
  };
}



(async () => {
  try {
    const allGames = await Promise.all(appIds.map(fetchSteamData));
    fs.writeFileSync('steamData.json', JSON.stringify(allGames, null, 2));
    console.log('✅ Steam 数据拉取成功');
  } catch (err) {
    console.error('❌ 拉取 Steam 数据失败:', err);
    process.exit(1);
  }
})()