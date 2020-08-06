const request = require("request-promise");
const cheerio = require("cheerio");

const url = "https://www.rome2rio.com/sitemap.xml";

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

    return justEnglishLinks;
  } catch (error) {
    console.error(error);
  }
}

async function scrapeDetails(itinaryUrl) {
  try {
    const htmlResult = await request.get(itinaryUrl);
    const $ = await cheerio.load(htmlResult);
    const summary = await $(".intro-summary__details").text();

    const textInfo = await $(".section__description").text();

    const operators = await $(".operator__heading").text();

    const durationRegex = summary.match(/\d+ (.*?)min/);

    const distanceRegex = summary.match(/(.*?)km/);

    const frequencyRegex = summary.match(/(.*?)hour/);

    //const InfoRegex = textInfo.match(/(.*?)\n/);
    const InfoRegex = textInfo.split(/(.*?)\n/);

    const operatorsRegex = operators.split(/(.*?)\n/);

    var justInfos = InfoRegex.filter(function (element, index, array) {
      return index % 4 === 3;
    });

    var justOperators = operatorsRegex.filter(function (element, index, array) {
      return index % 4 === 3;
    });

    for (var c = 0; c < justOperators.length; c++) {
      justOperators[c] = justOperators[c].trim();
    }

    for (var d = 0; d < justInfos.length; d++) {
      justInfos[d] = justInfos[d].trim();
    }

    let distance;
    let duration;
    let frequency;

    const itinaryUrlSplitted = itinaryUrl.split("/");
    const to = itinaryUrlSplitted[itinaryUrlSplitted.length - 1];
    const from = itinaryUrlSplitted[itinaryUrlSplitted.length - 2];
    const by = itinaryUrlSplitted[itinaryUrlSplitted.length - 3];

    if (distanceRegex !== null) {
      distance = distanceRegex[0].trim();
    } else {
      distance = "0 km";
    }

    if (durationRegex !== null) {
      duration = durationRegex[0];
    } else {
      duration = "0 min";
    }

    if (frequencyRegex !== null) {
      frequency = frequencyRegex[0].trim();
    } else {
      frequency = "0/hour";
    }

    const data = {
      from: from,
      to: to,
      by: by,
      duration: duration,
      distance: distance,
      frequency: frequency,
      operators: justOperators,
      texts: justInfos,
    };
    return data;
  } catch (error) {
    console.error(error);
  }
}
async function main() {
  const siteMap = await getSiteMap();
  //console.log("sitemap: ", siteMap[siteMap.length - 1]);
  for (var i = 1; i < siteMap.length; i++) {
    const siteMapElements = await scrapeSiteMapElements(siteMap[i]);
    /*
    console.log({
      siteMapUpperLink: siteMap[i],
      siteMapElements: siteMapElements,
    });
    */

    const details = await scrapeDetails(siteMapElements[0]);
    console.log(details);
  }
}

main();
