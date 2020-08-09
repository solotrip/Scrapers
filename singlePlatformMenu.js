const request = require("request-promise");
const cheerio = require("cheerio");

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

    const prices = $("[class='price']")
      .map((i, element) => {
        const hrefs = $(element).text();
        const trimmed = hrefs.trim();
        const hrefsMatch = hrefs.match(
          /https:\/\/www.hostelworld.com\/hostels\/(.*?)\'/
        );
        arr = hrefsMatch;

        return trimmed;
      })
      .get();

    const titles = $("[class='item-title']")
      .map((i, element) => {
        const hrefs = $(element).text();
        const trimmed = hrefs.trim();
        const hrefsMatch = hrefs.match(
          /https:\/\/www.hostelworld.com\/hostels\/(.*?)\'/
        );
        arr = hrefsMatch;

        return trimmed;
      })
      .get();

    const items = $("[class='item-title-row']")
      .map((i, element) => {
        const hrefs = $(element).text();
        const trimmed = hrefs.trim();
        const hrefsMatch = hrefs.match(
          /https:\/\/www.hostelworld.com\/hostels\/(.*?)\'/
        );
        arr = hrefsMatch;

        return trimmed;
      })
      .get();

    const script = await $("head > script:nth-child(44)").text;

    //console.log("script is :", script[0]);

    const coordinateLat = $("[property='place:location:latitude']").attr(
      "content"
    );

    const coordinateLng = $("[property='place:location:longitude']").attr(
      "content"
    );

    const title = $("[property='og:title']").attr("content");

    const keywords = $("[name='keywords']").attr("content");

    const description = $("[name='description']").attr("content");

    const priceRating = $("[property='restaurant:price_rating']").attr(
      "content"
    );

    const streetAddress = $(
      "[property='restaurant:contact_info:street_address']"
    ).attr("content");

    const locality = $("[property='restaurant:contact_info:locality']").attr(
      "content"
    );

    const region = $("[property='restaurant:contact_info:region']").attr(
      "content"
    );

    const postalCode = $(
      "[property='restaurant:contact_info:postal_code']"
    ).attr("content");

    const country = $("[property='restaurant:contact_info:country_name']").attr(
      "content"
    );

    const data = {
      title: title,
      keywords: keywords,
      description: description,
      priceRating: priceRating,
      menu: titles,
      prices: prices,
      streetAddress: streetAddress,
      locality: locality,
      region: region,
      postalCode: postalCode,
      country: country,
      lat: coordinateLat,
      lng: coordinateLng,
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
    const restaurants = await scrapeSiteMapElements(siteMap[i]);
    //console.log("restaurants: ", restaurants);
    for (var j = 0; j < restaurants.length; j++) {
      const restaurantDetails = await getVenue(restaurants[j]);
      console.log(restaurantDetails);
    }
  }
}

main();
