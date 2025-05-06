const fs = require('fs');
const axios = require('axios');

const appIds = ['2589500', '1737340', '2812610'];

async function fetchGameData(appId) {
    const cnUrl = `https://store.steampowered.com/api/appdetails?appids=${appId}&cc=cn&l=schinese`;
    const enUrl = `https://store.steampowered.com/api/appdetails?appids=${appId}&cc=us&l=english`;
    const reviewUrl = `https://store.steampowered.com/appreviews/${appId}?json=1&language=all&purchase_type=all`;



    const [cnRes, enRes,reviewRes] = await Promise.all([axios.get(cnUrl), axios.get(enUrl),axios.get(reviewUrl)]);

    const cnData = cnRes.data[appId].data;
    const enData = enRes.data[appId].data;
    const reviewData = reviewRes.data;
    const total = reviewData.query_summary?.total_reviews ?? 0;
    const positive = reviewData.query_summary?.total_positive ?? 0;
    const percentage = total > 0 ? Math.round((positive / total) * 100) : null;

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
        recommendations: cnData.recommendations?.total ?? 0,
        positive_percentage: percentage,  // ✅ 用真实用户评价计算
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
