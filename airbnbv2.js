const request = require("request-promise");
const cheerio = require("cheerio");

const url = "https://www.airbnb.com.tr/sitemaps/v2/destinations-L1-";

let totalRes = 20;

async function getSiteMap(urlParam) {
    try {
        const htmlResult = await request.get(urlParam);
        const $ = await cheerio.load(htmlResult);

        const all = await $("[href]")
            .map((i, element) => {
                const hrefs =
                    "https://www.airbnb.com.tr" + $(element).attr("href") + "'";
                const hrefsMatch = hrefs.match(/(.*?)\/stays'/);
                arr = hrefsMatch;

                return hrefsMatch;
            })
            .get();

        var allsite = all.filter(function(element, index, array) {
            return index % 2 === 0;
        });

        var sitemap = allsite.map((place) => place.slice(0, -1));

        return sitemap;
    } catch (error) {
        console.error(error);
    }
}

async function getSiteMapElements(urlParam) {
    try {
        const htmlResult = await request.get(urlParam);
        const $ = await cheerio.load(htmlResult);

        //Show all link
        const all = await $("[href]")
            .map((i, element) => {
                const hrefs =
                    "https://www.airbnb.com.tr" + $(element).attr("href") + "'";
                const hrefsMatch = hrefs.match(/(.*?)\/stays'/);
                arr = hrefsMatch;

                return hrefs;
            })
            .get();

        var sliced = await all.map((place) => place.slice(0, -1));

        var showAllLink = await sliced.filter((element) =>
            element.includes("/homes?place_id=")
        );

        return showAllLink;
    } catch (error) {
        console.error(error);
    }
}

async function countResults(urlParam) {
    try {
        const htmlResult = await request.get(urlParam);
        const $ = await cheerio.load(htmlResult);

        //Total results
        const totalResults = $(
            "#ExploreLayoutController > div > div > div > div > section > div"
        ).text();

        const totalResultFind = await totalResults.match(/\d+/);

        const totalResultString = totalResultFind[0];

        const totalResultInteger = parseInt(totalResultString);

        totalRes = totalResultInteger;

        return totalRes;
    } catch (error) {
        console.error(error);
    }
}

async function listPlaces(urlParam) {
    try {
        const htmlResult = await request.get(urlParam);
        const $ = await cheerio.load(htmlResult);

        const homes = await $("[data-check-info-section='true']")
            .map((i, element) => {
                const hrefs =
                    "https://www.airbnb.com.tr" + $(element).attr("href") + "'";

                return hrefs;
            })
            .get();

        return homes;
    } catch (error) {
        console.error(error);
    }
}

async function openPlace(urlParam) {
    try {
        const htmlResult = await request.get(urlParam);
        const $ = await cheerio.load(htmlResult);

        const info = await $("[id='data-state']").html();

        const htmlResultStr = String(htmlResult);

        const matched = await htmlResultStr.match(/"queries": \[(.*?)\]/);

        return info;
    } catch (error) {
        console.error(error);
    }
}

async function main() {
    for (var i = 0; i < 1988; i++) {
        const siteMap = await getSiteMap(url + i);
        for (var j = 0; j < siteMap.length; j++) {
            const showAll = await getSiteMapElements(siteMap[j]);
            if (showAll !== undefined) {
                const resultsCount = await countResults(showAll[0]);
            }
            if (showAll !== undefined) {
                for (let index = 0; index <= totalRes; index = index + 20) {
                    const listedPlaces = await listPlaces(
                        showAll[0] + "&items_offset=" + index
                    );

                    for (var t = 0; t < listedPlaces.length; t++) {
                        const place = await openPlace(listedPlaces[t]);
                        console.log(place);
                    }
                }
            }
        }
    }
}

main();