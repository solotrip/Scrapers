const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

let browser;
let arr = [];

async function countPagesForCity(url, page) {
  try {
    await page.goto(url, { waitUntil: "networkidle2" });
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    const countPages = await $("[class='city-results ']")
      .map((i, element) => {
        const hrefs = $(element).text();
        const hrefsMatch = hrefs.match(/\d+/);
        arr = hrefsMatch;

        return hrefsMatch;
      })
      .get();

    const pageNumber = await parseInt(countPages[0], 10);

    return pageNumber;
  } catch (error) {
    console.error(error);
  }
}

async function openHostel(url, page) {
  try {
    await page.goto(url, { waitUntil: "networkidle2" });
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    const title = await $("[class='main-title']").text();
    const score = await $("[class='score']").text();
    const ratings = await $(
      "#pagebody > div > div > div > div > section.row-arrow.mb-5 > div > section:nth-child(1) > ul"
    ).text();
    const latestReviews = await $(
      "#pagebody > div > div > div > div > section.row-arrow.mb-5 > div > section:nth-child(2) > ul"
    ).text();

    const facilities = await $("[name='ms-facilities']").text();

    const description = await $("[class='description-property']").text();

    const data = {
      title: title,
      averageScore: score,
      ratings: ratings,
      latestReviews: latestReviews,
      facilities: facilities,
      description: description,
    };
    return data;
  } catch (error) {
    console.error(error);
  }
}

async function visitCity(url, page) {
  try {
    await page.goto(url, { waitUntil: "networkidle2" });
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    const pois = await $("[href]")
      .map((i, element) => {
        const hrefs = $(element).attr("href") + "'";
        const hrefsMatch = hrefs.match(
          /https:\/\/www.hostelworld.com\/hosteldetails.php\/(.*?)\'/
        );
        arr = hrefsMatch;

        return hrefsMatch;
      })
      .get();

    var plces = pois.filter(function (element, index, array) {
      return index % 2 === 0;
    });

    var places = plces.filter(function (item, pos) {
      return plces.indexOf(item) == pos;
    });

    var plcel = places.map((place) => place.slice(0, -1));

    var placesReviews = plcel.filter((element) => element.endsWith("reviews"));

    //All list - country list = activity list
    var justPlaces = plcel.filter((x) => !placesReviews.includes(x));

    return justPlaces;
  } catch (error) {
    console.error(error);
  }
}

async function browseCities(url, page) {
  try {
    await page.goto(url, { waitUntil: "networkidle2" });
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    const citiesRef = await $("[href]")
      .map((i, element) => {
        const hrefs = $(element).attr("href") + "'";
        const hrefsMatch = hrefs.match(
          /https:\/\/www.hostelworld.com\/findabed.php\/ChosenCity(.*?)\'/
        );
        arr = hrefsMatch;

        return hrefs;
      })
      .get();

    var clists = citiesRef.filter(function (element, index, array) {
      return index % 2 === 0;
    });

    var citiesRepeated = clists.map((place) => place.slice(0, -1));

    //Get rid of the duplicated elements.
    var cities = citiesRepeated.filter(function (item, pos) {
      return citiesRepeated.indexOf(item) == pos;
    });

    var catalement = cities.filter(
      (element) =>
        element.split("/").length === 6 &&
        element.startsWith("https://www.hostelworld.com")
    );

    var clists = catalement.filter(function (element, index, array) {
      return (
        element !== "https://signup.hostelworld.com/en/property/intro" &&
        element !== "http://www.hostelworldgroup.com/media/press-releases/" &&
        element !== "https://www.mapbox.com/about/maps/"
      );
    });
    return clists;
  } catch (error) {
    console.error(error);
  }
}

async function browseCountries(url, page) {
  try {
    await page.goto(url, { waitUntil: "networkidle2" });
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    const allCountries = await $("[href]")
      .map((i, element) => {
        const hrefs = $(element).attr("href") + "'";
        const hrefsMatch = hrefs.match(
          /https:\/\/www.hostelworld.com\/hostels\/(.*?)\'/
        );
        arr = hrefsMatch;

        return hrefsMatch;
      })
      .get();

    var cs = allCountries.filter(function (element, index, array) {
      return index % 2 === 0 && index !== 0;
    });

    var countries = cs.map((place) => place.slice(0, -1));

    var eliminatedCountries = countries.filter(function (
      element,
      index,
      array
    ) {
      return (
        element !== "https://www.hostelworld.com/hostels/Amsterdam" &&
        element !== "https://www.hostelworld.com/hostels/Budapest" &&
        element !== "https://www.hostelworld.com/hostels/Lisbon" &&
        element !== "https://www.hostelworld.com/hostels/Paris" &&
        element !== "https://www.hostelworld.com/hostels/Rome" &&
        element !== "https://www.hostelworld.com/hostels/Berlin" &&
        element !== "https://www.hostelworld.com/hostels/Florence" &&
        element !== "https://www.hostelworld.com/hostels/London" &&
        element !== "https://www.hostelworld.com/hostels/Prague" &&
        element !== "https://www.hostelworld.com/hostels/Vienna" &&
        element !== "https://www.hostelworld.com/hostels/europe" &&
        element !== "https://www.hostelworld.com/hostels/asia" &&
        element !== "https://www.hostelworld.com/hostels/north-america" &&
        element !== "https://www.hostelworld.com/hostels/south-america" &&
        element !== "https://www.hostelworld.com/hostels/oceania" &&
        element !== "https://www.hostelworld.com/hostels/africa"
      );
    });

    /*

      .filter(async function (element, index, array) {
        const ids = (await $(element).attr("id")) + "'";
        const idsMatch = ids.match(/hwta-country(.*?)\'/);
        console.log("ids match :", ids);
        return idsMatch;
      })

      */

    /*
      var countries = allCountries.filter(function (element, index, array) {
      const ids = $(element).attr("id") + "'";
      return ids;
    });
    */

    return eliminatedCountries;
  } catch (error) {
    console.error(error);
  }
}

async function main() {
  browser = await puppeteer.launch({ headless: true });
  const countriesUrl = "https://www.hostelworld.com/hostels";
  const countriesPage = await browser.newPage();

  const citiesPage = await browser.newPage();
  const counterForCityPage = await browser.newPage();
  const cityPage = await browser.newPage();
  const hostelPage = await browser.newPage();
  const countries = await browseCountries(countriesUrl, countriesPage);
  //console.log("countries: ", countries);

  for (var i = 0; i < countries.length; i++) {
    const cities = await browseCities(countries[i], citiesPage);

    //console.log(countries[i], " 's cities : ", cities);

    for (var j = 0; j < cities.length; j++) {
      const results = await countPagesForCity(cities[j], counterForCityPage);
      const pages = Math.ceil(results / 30);
      //console.log(cities[j], " 's pages: ", pages);

      for (var t = 0; t < pages; t++) {
        console.log(
          "city number ",
          j,
          "of",
          cities.length,
          "cities length:",
          "for country: ",
          countries[i]
        );
        const places = await visitCity(cities[j] + "?page=" + t, cityPage);
        console.log(
          "page",
          t,
          "of city number ",
          j,
          ":",
          cities[j],
          "'s places: ",
          places
        );

        const details = await openHostel(places[0], hostelPage);
        console.log("details : ", details);
      }
    }
  }
}
main();
