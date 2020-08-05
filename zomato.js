const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

const sample = {
  guests: 1,
  bedrooms: 1,
  beds: 1,
  baths: 1,
  pesosPerNight: 350,
};

let browser;

async function openRestaurant(url, page) {
  try {
    await page.goto(url, { waitUntil: "load", timeOut: 0 });
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    const restaurantTitle = await $(
      "#root > main > div > section > section > section > h1"
    ).text();

    const restaurantCategory = await $(
      "#root > main > div > section > section > section > section > div"
    ).text();

    const openHours = await $(
      "#root > main > div > section > section > section > section > span"
    ).text();

    const knownFor = await $(
      "#root > main > div > section > section > section > article > section > p"
    ).text();

    const averagePrice = await $(
      "#root > main > div > section > section > section > article > section > p"
    ).text();

    const score = await $(
      "#root > main > div > section > section > section > section > div > p"
    ).text();

    const telephoneNumber = await $(
      "#root > main > div > section > section > article > p"
    ).text();

    const keywords = await $("#root > main > div > div > div > div").text();

    const data = {
      title: restaurantTitle,
      category: restaurantCategory,
      score: score,
      open: openHours,
      knownFor: knownFor,
      averagePrice: averagePrice,
      phone: telephoneNumber,
      keywords: keywords,
    };

    return data;
  } catch (error) {
    console.error(error);
  }
}

async function browseRestaurants(url, page) {
  try {
    await page.goto(url, { waitUntil: "load", timeOut: 0 });
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    const restaurante = await $(
      "#orig-search-list > div > div.content > div > article > div.pos-relative.clearfix > div > div > div > div > a"
    )
      .map((i, element) => {
        const hrefs = $(element).attr("href") + "'";
        const hrefsMatch = hrefs.match(/catalog\/(.*?)\'/);
        arr = hrefsMatch;

        return hrefs;
      })
      .get();

    var restaurants = restaurante.map((place) => place.slice(0, -1));

    return restaurants;
  } catch (error) {
    console.error(error);
  }
}

async function openCity(url, page) {
  try {
    await page.goto(url, { waitUntil: "load", timeOut: 3000 });
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    const subCities = await $("[href]")
      .map((i, element) => {
        const hrefs = $(element).attr("href") + "'";
        const hrefsMatch = hrefs.match(/catalog\/(.*?)\'/);
        arr = hrefsMatch;

        return hrefs;
      })
      .get();

    var sc = subCities.map((place) => place.slice(0, -1));
    var justSubCities = sc.filter((element) => element.split("/").length === 6);

    var subc = justSubCities.filter(
      (element) => element.endsWith("/") === false
    );

    var regexMatched = subc.filter((element) => element.match(/(.*?)dine-out/));

    var regexMatched2 = subc.filter((element) => element.match(/(.*?)gold/));

    var regexMatched3 = subc.filter((element) =>
      element.match(/(.*?)drinks-and-nightlife/)
    );

    var regexMatched4 = subc.filter((element) =>
      element.match(/(.*?)order-food-online\?delivery_subzone=\d+/)
    );

    //All subc - regexMatched = subcts ( we made 4 filters ( filtered out 4 regex serially.))
    var subcts = subc.filter((x) => !regexMatched.includes(x));

    var subcts2 = subcts.filter((x) => !regexMatched2.includes(x));

    var subcts3 = subcts2.filter((x) => !regexMatched3.includes(x));

    var subcts4 = subcts3.filter((x) => !regexMatched4.includes(x));

    return subcts4;
  } catch (error) {
    console.error(error);
  }
}

async function browseCountry(url, page) {
  try {
    await page.goto(url, { waitUntil: "networkidle2" });
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    const cities = await $("[href]")
      .map((i, element) => {
        const hrefs = $(element).attr("href") + "'";
        const hrefsMatch = hrefs.match(/catalog\/(.*?)\'/);
        arr = hrefsMatch;

        return hrefs;
      })
      .get();

    var citylist = cities.map((place) => place.slice(0, -1));

    var justCities1 = citylist.filter(
      (element) => element.endsWith("/") === false
    );

    var justCities = justCities1.filter(
      (element) => element.split("/").length > 4
    );

    justCities.pop();
    justCities.pop();

    return justCities;
  } catch (error) {
    console.error(error);
  }
}

async function main() {
  browser = await puppeteer.launch({ headless: false });
  const mainPageUrl = "https://zomato.com/";
  const browseCountryPage = await browser.newPage();
  const cityPage = await browser.newPage();
  const restaurantsPage = await browser.newPage();
  const thatRestaurantPage = await browser.newPage();

  const countries = [
    "india",
    "australia",
    "brasil",
    "canada",
    "chile",
    "czech-republic",
    "indonesia",
    "ireland",
    "italy",
    "lebanon",
    "malaysia",
    "newzealand",
    "philippines",
    "poland",
    "portugal",
    "qatar",
    "singapore-country",
    "slovakia",
    "southafrica",
    "srilanka",
    "turkey",
    "uae",
    "uk",
    "united-states",
  ];

  for (var i = 0; i < countries.length; i++) {
    const cities = await browseCountry(
      mainPageUrl + countries[i],
      browseCountryPage
    );
    //console.log({ countryId: i, cities: cities });
    for (var j = 0; j < cities.length; j++) {
      const subcities = await openCity(cities[j], cityPage);

      //console.log({ countryId: i, cityId: j, city: subcities });
      for (var k = 0; k < subcities.length; k++) {
        const restaurants = await browseRestaurants(
          subcities[k],
          restaurantsPage
        );
        for (var t = 0; t < restaurants.length; t++) {
          const restaurant = await openRestaurant(
            restaurants[t],
            thatRestaurantPage
          );

          console.log({
            country: countries[i],
            cityUrl: cities[j],
            subcityUrl: subcities[k],
            restaurantUrl: restaurants[t],
            restaurant: restaurant,
          });
        }
      }
    }
  }
}

main();
