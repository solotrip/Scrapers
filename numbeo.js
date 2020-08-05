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
let arr = [];

async function visitNumbeo(url, page) {
  try {
    await page.goto(url);
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    const totalResults = await $("#content_and_logo > table > tbody").text();

    //const totalResultFind = await totalResults.match(
    //  /(?=History\[edit]).*((?:[^\n][\n]?)+)/
    //);

    //const totalResultString = totalResultFind[0];

    //console.log(totalResultString);
    //console.log(totalResults);
    return totalResults;
  } catch (error) {
    console.error(error);
  }
}

//selectOption is the dropdown menus option to be selected.
async function selectCityFromListOfCities(url, numberOfOptions) {
  const page = await browser.newPage();
  try {
    var i;
    for (i = 0; i < numberOfOptions; i++) {
      await page.goto(url, { waitUntil: "networkidle2" });

      let selection = await page.evaluate(async (i) => {
        await document.querySelector("#city").selectedIndex;
        document.querySelector("#city").selectedIndex = i + 1;
        await document.querySelector("#city").form.submit();
      }, i);

      const html = await page.evaluate(() => document.body.innerHTML);
      const $ = await cheerio.load(html);

      const totalResults = await $("#content_and_logo > table > tbody").text();
      console.log("city info:", totalResults);

      const data = {
        info: totalResults,
      };
      return data;
    }
  } catch (error) {
    await page.reload({ waitUntil: "networkidle2" });
    console.error(error);
  }
  await page.close();
}

async function getListOfCities(url, page) {
  try {
    await page.goto(url, { waitUntil: "networkidle2" });
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    const citiesList = await $("#city > option")
      .map((i, element) => {
        const hrefs = $(element).text() + "'";
        const hrefsMatch = hrefs.match(/country_result.jsp\?(.*?)\'/);
        arr = hrefsMatch;

        return hrefs;
      })
      .get();

    var cities = citiesList.filter(function (element, index, array) {
      return index % 1 === 0;
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

    const countryList = await $("[href]")
      .map((i, element) => {
        const hrefs =
          "https://www.numbeo.com/cost-of-living/" +
          $(element).attr("href") +
          "'";
        const hrefsMatch = hrefs.match(
          /https\:\/\/www.numbeo.com\/cost-of-living\/country_result.jsp\?(.*?)\'/
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
  const countriesUrl = "https://www.numbeo.com/cost-of-living/";
  const countriesPage = await browser.newPage();
  const citiesPage = await browser.newPage();
  //const statsPage = await browser.newPage();

  const countries = await getListOfCountries(countriesUrl, countriesPage);
  console.log(countries);

  //go to specific country page and get cities of it.

  for (var i = 0; i < countries.length; i++) {
    const cities = await getListOfCities(countries[i], citiesPage);
    console.log(cities.length);

    //Open up  a new page for 'number of city options' times. (cities.lenght -1 )
    const cityBrowsers = [];

    const arbitraryCityPage = await selectCityFromListOfCities(
      countries[i],
      cities.length - 1
    );
    console.log(arbitraryCityPage);
  }

  /* 
    
    
    const cityStats = await visitNumbeo(
        "https://www.numbeo.com/cost-of-living/in/Istanbul",
        statsPage
      );
      console.log("city stats for city:", city, cityStats);
      
  }
  */
}

main();
