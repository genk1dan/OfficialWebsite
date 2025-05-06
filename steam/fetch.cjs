const fs = require('fs');
const axios = require('axios');

const appIds = ['2589500', '1737340', '2812610'];

async function fetchGameData(appId) {
    const cnUrl = `https://store.steampowered.com/api/appdetails?appids=${appId}&cc=cn&l=schinese`;
    const enUrl = `https://store.steampowered.com/api/appdetails?appids=${appId}&cc=us&l=english`;



    const [cnRes, enRes] = await Promise.all([axios.get(cnUrl), axios.get(enUrl)]);

    const cnData = cnRes.data[appId].data;
    const enData = enRes.data[appId].data;
    const recommendations = cnData.recommendations?.total || 0;
    const positive = cnData.recommendations?.total_positive || 0;
    const percentage = recommendations > 0 ? Math.round((positive / recommendations) * 100) : null;

    return {
        appId: appId,
        name: {
            zh: cnData.name,
            en: enData.name
        },
        short_description: {
            zh: cnData.short_description,
            en: enData.short_description
        },
        genres: {
            zh: cnData.genres.map(g => g.description),
            en: enData.genres.map(g => g.description)
        },
        header_image: cnData.header_image,
        recommendations: recommendations,
        positive_percentage: percentage,
        link: `https://store.steampowered.com/app/${appId}/`
    };
}

(async () => {
    const results = [];
    for (const id of appIds) {
        try {
            const data = await fetchGameData(id);
            results.push(data);
        } catch (e) {
            console.error(`Failed to fetch for app ${id}:`, e.message);
        }
    }

    fs.writeFileSync('./steamData.json', JSON.stringify(results, null, 2), 'utf-8');
})();
