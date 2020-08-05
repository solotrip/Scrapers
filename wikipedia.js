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

async function visitWikipedia(url, page) {
  try {
    await page.goto(url, { waitUntil: "networkidle2" });
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    const totalResults = await $("#mw-content-text > div").text();

    const totalResultFind = await totalResults.match(
      /(?=History\[edit]).*((?:[^\n][\n]?)+)/
    );

    if (totalResultFind === null) {
      return "";
    } else {
      const totalResultString = totalResultFind[0];
      return totalResultString;
    }
  } catch (error) {
    console.error(error);
  }
}

async function getListOfCities(url, page) {
  try {
    await page.goto(url, { waitUntil: "networkidle2" });
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    const citiesList = await $(
      "#mw-content-text > div > table > tbody > tr > td > a"
    )
      .map((i, element) => {
        const hrefs =
          "https://en.wikipedia.org" + $(element).attr("href") + "'";
        const hrefsMatch = hrefs.match(
          /https\:\/\/en.wikipedia.org\/wiki\/(.*?)\'/
        );
        arr = hrefsMatch;

        return hrefsMatch;
      })
      .get();

    var cities = citiesList.filter(function (element, index, array) {
      return index % 2 === 0;
    });

    var finalCityList = cities.map((place) => place.slice(0, -1));

    return finalCityList;
  } catch (error) {
    console.error(error);
  }
}

async function getListOfCountries(url, page) {
  try {
    await page.goto(url, { waitUntil: "networkidle2" });
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    const countryList = await $(
      "#mw-content-text > div > div.navbox > table > tbody > tr > td > div > ul > li > a"
    )
      .map((i, element) => {
        const hrefs =
          "https://en.wikipedia.org" + $(element).attr("href") + "'";
        const hrefsMatch = hrefs.match(
          /https\:\/\/en.wikipedia.org\/wiki\/List_of_cities_in(.*?)\'/
        );
        arr = hrefsMatch;

        return hrefsMatch;
      })
      .get();

    var countries = countryList.filter(function (element, index, array) {
      return index % 2 === 0;
    });

    var finalCountryList = countries.map((place) => place.slice(0, -1));

    return finalCountryList;
  } catch (error) {
    console.error(error);
  }
}

async function main() {
  browser = await puppeteer.launch({ headless: false });
  const countriesUrl = "https://en.wikipedia.org/wiki/Lists_of_cities";
  const countriesPage = await browser.newPage();
  const citiesPage = await browser.newPage();
  const wikiPage = await browser.newPage();

  const countries = await getListOfCountries(countriesUrl, countriesPage);
  //console.log(countries);

  for (var i = 0; i < countries.length; i++) {
    const cities = await getListOfCities(countries[i], citiesPage);
    //console.log(cities);

    for (var j = 0; j < countries.length; j++) {
      if (cities[j] !== undefined) {
        //console.log(cities[j]);
        const history = await visitWikipedia(cities[j], wikiPage);
        const data = {
          country: countries[i],
          city: cities[j],
          history: history,
        };
        console.log(data);
      }
    }
  }
}

main();
