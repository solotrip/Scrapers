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

async function getListOfSubCities(url, page) {
  try {
    await page.goto(url, { waitUntil: "networkidle2" });
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    const subCityList = await $("[class='search-result']")
      .map((i, element) => {
        const url = $(element).attr("href");

        return "https://accuweather.com" + url;
      })
      .get();
    return subCityList;
  } catch (error) {
    console.error(error);
  }
}

async function getListOfCities(url, page) {
  try {
    await page.goto(url, { waitUntil: "networkidle2" });
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    const cityList = await $("[class='search-result']")
      .map((i, element) => {
        const url = $(element).attr("href");

        return "https://accuweather.com" + url;
      })
      .get();
    return cityList;
  } catch (error) {
    console.error(error);
  }
}

async function getListOfCountries(url, page) {
  try {
    //const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    const countryList = await $("[class='search-result']")
      .map((i, element) => {
        const url = $(element).attr("href");

        return "https://accuweather.com" + url;
      })
      .get();
    return countryList;
  } catch (error) {
    console.error(error);
  }
}

async function getListOfRegions(url) {
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    const regionList = await $("[class='search-result']")
      .map((i, element) => {
        const url = $(element).attr("href");
        const splitted = url.split("\n");
        return "https://accuweather.com" + url;
      })
      .get();
    return regionList;

    //console.log("list of regions: ", regionList);
  } catch (error) {
    console.error(error);
  }
}

async function goToCityWeatherMainPage(url, page) {
  try {
    await page.goto(url, { waitUntil: "networkidle2" });
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    const monthlyPage = await $("[data-gaid='monthly']")
      .map((i, element) => {
        const url = $(element).attr("href");

        return "https://accuweather.com" + url;
      })
      .get();
    return monthlyPage;
  } catch (error) {
    console.error(error);
  }
}

async function scrapeCityWeatherTable(url, page) {
  try {
    await page.goto(url, { waitUntil: "networkidle2" });
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    const cityName = await $(
      "[class='recent-location-display-label location-label']"
    ).text();

    const currentTemp = $("[class='recent-location-display-label']").text();

    const totalResults = await $("[class='monthly-daypanel is-past ']").text();

    //await console.log("city:", cityName);
    //await console.log("current temperature: ", currentTemp);
    //await console.log("Weather data for month: ", totalResults);

    const data = {
      city: cityName,
      currentTemperature: currentTemp,
      weatherData: totalResults,
    };

    return data;
  } catch (error) {
    console.error(error);
  }
}

async function main() {
  browser = await puppeteer.launch({ headless: false });

  //Browse list of regions.
  const regions = await getListOfRegions(
    "https://www.accuweather.com/en/browse-locations/"
  );
  console.log("list of regions: ", regions);

  //Browse countries for each region.

  const countriesPage = await browser.newPage();
  const citiesPage = await browser.newPage();
  const subCitiesPage = await browser.newPage();
  const cityWeatherPage = await browser.newPage();
  const monthlyWeatherPage = await browser.newPage();

  for (var i = 0; i < regions.length; i++) {
    const countries = await getListOfCountries(regions[i], countriesPage);
    console.log("list of countries for region number: ", i, countries);

    //Browse cities for each country.
    for (var j = 0; j < countries.length; j++) {
      const cities = await getListOfCities(countries[j], citiesPage);
      //console.log("list of cities: ", cities);

      //Browse subcity locations for each city.

      for (var k = 0; k < cities.length; k++) {
        const subCities = await getListOfSubCities(cities[k], subCitiesPage);
        //console.log("list of subcity locations: ", subCities);

        //Go to monthly tab.
        for (var l = 0; l < subCities.length; l++) {
          const monthlyPage = await goToCityWeatherMainPage(
            subCities[l],
            cityWeatherPage
          );
          //console.log("monthly page:", monthlyPage);

          //Get weather data from specific page.(Monthly tab.)
          const weather = await scrapeCityWeatherTable(
            monthlyPage[0],
            monthlyWeatherPage
          );
          console.log({
            weather: weather,
            subcity: subCities[l],
            city: cities[k],
            country: countries[j],
            region: regions[i],
          });
        }
      }
    }
  }

  //scrapeCityWeatherTable(
  // "https://www.accuweather.com/en/tr/istanbul/318251/july-weather/318251"
  //);
}

main();
