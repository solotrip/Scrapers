const request = require("request-promise");
const cheerio = require("cheerio");

const url = "https://4sq-sitemap.s3.amazonaws.com/sitemap_index.xml";

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

    const ratingOutOf10 = $("[itemprop='ratingValue']").text();
    const name = $("[itemprop='name']").text();
    const category = $("[class='unlinkedCategory']").text();
    const venueCity = $("[class='venueCity']").text();
    const openHours = $("[class='open']").text();
    const instagramPage = $("[class='instagramPageLink']").text();
    const twitterPage = $("[class='twitterPageLink']").text();
    const facebookPage = $("[class='facebookPageLink']").text();
    const website = $("[itemprop='url']").text();
    const priceRange = $("[itemprop='priceRange']").text();
    const phoneNumber = $("[itemprop='telephone']").text();
    const relatedVenue = $("[class='relatedVenueWithTip']").text();
    const nextStops = $("[data-listtype='subsequent_venues']").text();

    const data = {
      title: name,
      rating: ratingOutOf10,
      price: priceRange,
      category: category,
      venue: venueCity,
      openHours: openHours,
      relatedVenues: relatedVenue,
      nextStops: nextStops,
      instagram: instagramPage,
      website: website,
      twitter: twitterPage,
      facebook: facebookPage,
      phone: phoneNumber,
    };

    return data;
  } catch (error) {
    console.error(error);
  }
}

async function main() {
  const siteMap = await getSiteMap();
  //console.log("site map: ", siteMap);
  for (var i = 0; i < siteMap.length; i++) {
    const siteMapElements = await scrapeSiteMapElements(siteMap[i]);
    //console.log("site map elements for :", siteMap[0], "is: ", siteMapElements);
    for (var j = 0; j < siteMapElements.length; j++) {
      const venueDetails = await getVenue(siteMapElements[j]);
      console.log({
        siteMap: siteMap[i],
        VenueUrl: siteMapElements[j],
        venue: venueDetails,
      });
    }
  }
}

main();
