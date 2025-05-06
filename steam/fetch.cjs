const fs = require('fs');
const axios = require('axios');


const appIds = ['2589500', '1737340', '2812610'];

async function fetchGameData(appId) {
    const cnUrl = `https://store.steampowered.com/api/appdetails?appids=${appId}&cc=cn&l=schinese`;
    const enUrl = `https://store.steampowered.com/api/appdetails?appids=${appId}&cc=us&l=english`;

    const [cnRes, enRes] = await Promise.all([axios.get(cnUrl), axios.get(enUrl)]);

    const cnData = cnRes.data[appId].data;
    const enData = enRes.data[appId].data;

    return {
        appId: appId,
        name: cnData.name,
        name_en: enData.name,
        header_image: cnData.header_image,
        short_description: cnData.short_description,
        short_description_en: enData.short_description,
        genres: cnData.genres.map(g => g.description),
        recommendations: cnData.recommendations?.total || 0,
        positive_percentage: cnData.positive || null,
        link: `https://store.steampowered.com/app/${appId}/`
    };
}

(async () => {
    const results = [];
    for (const appId of appIds) {
        try {
            const game = await fetchGameData(appId);
            results.push(game);
        } catch (err) {
            console.error(`Failed to fetch data for app ${appId}:`, err.message);
        }
    }
    fs.writeFileSync('./steamData.json', JSON.stringify(results, null, 2));
})();
