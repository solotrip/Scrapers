const request = require("request-promise");
const cheerio = require("cheerio");

const fetchCityIdsLink = "https://worldweather.wmo.int/en/json/";

async function getSiteMap(url) {
  try {
    const htmlResult = await request.get(url);
    const $ = await cheerio.load(htmlResult);

    const htmlResultStr = String(htmlResult);

    return htmlResultStr;
  } catch (error) {
    console.error(error);
  }
}

async function main() {
  for (var i = 0; i < 2966; i++) {
    const siteMap = await getSiteMap(fetchCityIdsLink + i + "_en.json");
    console.log(siteMap);
  }
}

main();
