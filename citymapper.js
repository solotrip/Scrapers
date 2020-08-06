const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

let browser;

async function goToThatLine(url, page) {
  try {
    await page.goto(url, { waitUntil: "networkidle2" });
    //await page.goto(url, { waitUntil: "load", timeOut: 3000 });
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    const stops = await $(
      "#content > div > div > div > div > div > div > div > ul > li > a > div > span"
    )
      .map((i, element) => {
        const hrefs = $(element).text();

        return hrefs;
      })
      .get();

    const data = {
      line: url,
      stops: stops,
    };

    return data;
  } catch (error) {
    console.error(error);
  }
}

async function getLines(url, page) {
  try {
    await page.goto(url, { waitUntil: "networkidle2" });
    //await page.goto(url, { waitUntil: "load", timeOut: 3000 });
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    const links = await $("[href]")
      .map((i, element) => {
        const hrefs = "https://citymapper.com" + $(element).attr("href");

        return hrefs;
      })
      .get();

    var lines = links.filter(
      (element) =>
        element.split("/").length === 6 &&
        element.startsWith("https://citymapper.com/") &&
        element !==
          "https://citymapper.comhttps://engineering.citymapper.com/" &&
        element !==
          "https://citymapper.com/api/1/resources?id=citymapper-privacy-policy" &&
        element !==
          "https://citymapper.com/api/1/resources?id=citymapper-terms-of-service"
    );

    return lines;
  } catch (error) {
    console.error(error);
  }
}

async function openCity(url, page) {
  try {
    await page.goto(url, { waitUntil: "networkidle2" });
    //await page.goto(url, { waitUntil: "load", timeOut: 3000 });
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    const links = await $("[href]")
      .map((i, element) => {
        const hrefs = "https://citymapper.com" + $(element).attr("href");

        return hrefs;
      })
      .get();

    var lines = links.filter((element) => element.endsWith("status"));
    return lines;
  } catch (error) {
    console.error(error);
  }
}

async function browseCities(url, page) {
  try {
    await page.goto(url, { waitUntil: "networkidle2" });
    //await page.goto(url, { waitUntil: "load", timeOut: 3000 });
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    const links = await $("[href]")
      .map((i, element) => {
        const hrefs = "https://citymapper.com" + $(element).attr("href");

        return hrefs;
      })
      .get();

    var cities = links.filter((element) => element.includes("?set_region="));

    return cities;
  } catch (error) {
    console.error(error);
  }
}

async function main() {
  browser = await puppeteer.launch({ headless: false });
  const citiesPage = await browser.newPage();
  const thatCityPage = await browser.newPage();
  const linesPage = await browser.newPage();
  const thatLinePage = await browser.newPage();
  const citiesUrl = "https://citymapper.com/cities";

  const cities = await browseCities(citiesUrl, citiesPage);
  //console.log("cities: ", cities);
  for (var i = 0; i < cities.length; i++) {
    const cityDetail = await openCity(cities[i], thatCityPage);
    //console.log("city page :", cityDetail);
    const lines = await getLines(cityDetail[0], linesPage);
    //console.log("lines:", lines);
    for (var j = 0; j < lines.length; j++) {
      const stops = await goToThatLine(lines[j], thatLinePage);
      console.log(stops);
    }
  }
}

main();
