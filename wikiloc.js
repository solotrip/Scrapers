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

async function openSpecificTrail(url, page) {
  await page.goto(url, { waitUntil: "networkidle2" });
  const html = await page.evaluate(() => document.body.innerHTML);
  const $ = await cheerio.load(html);
  //console.log("url:", url);

  const trailDetails = await $("#trail-data > div > h4").text();
  const trailDetails2 = await $(
    "#trail-data > div.data-items.clearfix > div > a > span"
  ).text();

  const trailDetail3 = await $(
    "#primary > div.description.dont-break-out > p"
  ).text();

  const trailDetail4 = await $(
    "#primary > div.description.dont-break-out"
  ).text();

  const wayPoints = await $("[class='simplecard__breadcrumb__title']").text();

  const map = await $("#map-canvas");

  const elevation = await $("#elevation-profile-svg > polyline:nth-child(2)");

  const data = {
    info: trailDetails,
    stats: trailDetails2,
    more: trailDetail3,
    description: trailDetail4,
    wayPoints: wayPoints,
    map: map,
    elevation: elevation,
  };

  return data;
}

async function openCityAndScrape(url, page) {
  await page.goto(url, { waitUntil: "networkidle2" });
  const html = await page.evaluate(() => document.body.innerHTML);
  const $ = await cheerio.load(html);
}

async function openCountryAndScrape(url, page) {
  await page.goto(url, { waitUntil: "networkidle2" });
  const html = await page.evaluate(() => document.body.innerHTML);
  const $ = await cheerio.load(html);

  const cityList = await $("[href]")
    .map((i, element) => {
      const hrefs = $(element).attr("href") + "'";
      const hrefsMatch = hrefs.match(/trails\/outdoor(.*?)\'/);
      arr = hrefsMatch;

      return hrefsMatch;
    })
    .get();

  var clists = cityList.filter(function (element, index, array) {
    return index % 2 === 0;
  });

  var cities = clists.map((place) => place.slice(0, -1));
  cities.reverse();
  cities.shift();

  var citiesFinal = cities.map((x) => "https://www.wikiloc.com/" + x);

  return citiesFinal;
}

async function openActivityAndScrape(url, page) {
  await page.goto(url, { waitUntil: "networkidle2" });
  const html = await page.evaluate(() => document.body.innerHTML);
  const $ = await cheerio.load(html);

  const trailsOfActivity = await $("#trails > ul > li > div > div > h3 > a")
    .map((i, element) => {
      const hrefs = $(element).attr("href");

      return hrefs;
    })
    .get();

  return trailsOfActivity;
}

async function getListOfTrails(
  url,
  page,
  activityPage,
  specificTrailPage,
  countryPage,
  cityPage,
  cityTrailPage
) {
  try {
    await page.goto(url, { waitUntil: "networkidle2" });
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    const allList = await $("[href]")
      .map((i, element) => {
        const hrefs = $(element).attr("href") + "'";
        const hrefsMatch = hrefs.match(/trails\/(.*?)\'/);
        arr = hrefsMatch;

        return hrefsMatch;
      })
      .get();

    const countryList = await $("[href]")
      .map((i, element) => {
        const hrefs = $(element).attr("href") + "'";
        const hrefsMatch = hrefs.match(/trails\/outdoor(.*?)\'/);
        arr = hrefsMatch;

        return hrefsMatch;
      })
      .get();

    var lists = allList.filter(function (element, index, array) {
      return index % 2 === 0;
    });

    var all = lists.map((place) => place.slice(0, -1));

    var countrylists = countryList.filter(function (element, index, array) {
      return index % 2 === 0;
    });

    var countries = countrylists.map((place) => place.slice(0, -1));

    //All list - country list = activity list
    var activities = all.filter((x) => !countries.includes(x));

    var activitiesFinal = activities.map((x) => "https://www.wikiloc.com/" + x);

    var countriesFinal = countries.map((x) => "https://www.wikiloc.com/" + x);

    //console.log(activitiesFinal);

    //Browse by activities.
    for (var i = 0; i < activitiesFinal.length; i++) {
      const trails = await openActivityAndScrape(
        activitiesFinal[i],
        activityPage
      );

      for (var j = 0; j < trails.length; j++) {
        const specificTrail = await openSpecificTrail(
          trails[j],
          specificTrailPage
        );
        const trailData = {
          activity: activitiesFinal[i],
          trail: trails[j],
          Data: specificTrail,
        };
        await console.log(trailData);
      }
    }

    //Browse by countries.
    for (var x = 0; x < countriesFinal.length; x++) {
      const cities = await openCountryAndScrape(countriesFinal[x], countryPage);

      //console.log("cities:", cities);
      for (var y = 0; y < cities.length; y++) {
        const citytrails = await openActivityAndScrape(cities[y], cityPage);
        //console.log("city", cities[y], "city trails", citytrails);

        for (var z = 0; z < citytrails.length; z++) {
          const specificCityTrail = await openSpecificTrail(
            citytrails[z],
            cityTrailPage
          );
          console.log("specific city trail: ", specificCityTrail);
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
}

async function main() {
  browser = await puppeteer.launch({ headless: false });
  const trailsUrl = "https://www.wikiloc.com/trails";
  const trailsPage = await browser.newPage();
  const activitiesPage = await browser.newPage();
  const specificTrailPage = await browser.newPage();
  const countryPage = await browser.newPage();
  const cityPage = await browser.newPage();
  const specificCityTrailPage = await browser.newPage();

  await getListOfTrails(
    trailsUrl,
    trailsPage,
    activitiesPage,
    specificTrailPage,
    countryPage,
    cityPage,
    specificCityTrailPage
  );
}

main();
