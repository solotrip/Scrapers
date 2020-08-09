const request = require("request-promise");
const cheerio = require("cheerio");
const _ = require('lodash')
const url = "https://viewmenu.com/sitemap.xml";

async function getSiteMap() {
  try {
    const htmlResult = await request.get(url);
    const $ = await cheerio.load(htmlResult);

    const htmlResultStr = String(htmlResult);

    const splitted = await htmlResultStr.split(/<loc>(.*?)\<\/loc>/);

    var allsite = splitted.filter(function (element, index, array) {
      return index % 2 === 1;
    });

    //console.log(allsite);
    return allsite;

    //console.log({ splitMatch });
  } catch (error) {
    console.error(error);
  }
}

async function scrapeSiteMapElements(siteMapUrl) {
  try {
    const htmlResult = await request.get(siteMapUrl);
    const $ = await cheerio.load(htmlResult);

    const htmlResultStr = String(htmlResult);

    const splitted = await htmlResultStr.split(/<loc>(.*?)\<\/loc>/);

    var allsite = splitted.filter(function (element, index, array) {
      return index % 2 === 1;
    });

    var filtered = allsite.filter(
      (element) =>
        element.includes("https://www.rome2rio.com/de/") ||
        element.includes("https://www.rome2rio.com/it/") ||
        element.includes("https://www.rome2rio.com/fr/") ||
        element.includes("https://www.rome2rio.com/es/") ||
        element.includes("https://www.rome2rio.com/de/") ||
        element.includes("https://www.rome2rio.com/pt/")
    );

    //All list - country list = activity list
    var justEnglishLinks = allsite.filter((x) => !filtered.includes(x));

    return allsite;
  } catch (error) {
    console.error(error);
  }
}

async function getVenue(venueUrl) {
  try {
    const htmlResult = await request.get(venueUrl);
    const $ = await cheerio.load(htmlResult);
    const jsonData = _.get([...$('script[type="application/ld+json"]').get()], '[0].children[0].data')
    return jsonData;
  } catch (error) {
    console.error(error);
  }
}

async function main() {
  const siteMap = await getSiteMap();
  //console.log("site map: ", siteMap);
  for (var i = 0; i < siteMap.length; i++) {
    const restaurants = await scrapeSiteMapElements(siteMap[i]);
    //console.log("restaurants: ", restaurants);
    for (var j = 0; j < restaurants.length; j++) {
      const restaurantDetails = await getVenue(restaurants[j]);
      console.log(restaurantDetails);
    }
  }
}

main();
