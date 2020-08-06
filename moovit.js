const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

let browser;

async function thatPublicLine(url, page) {
  try {
    await page.goto(url, { waitUntil: "networkidle2" });
    //await page.goto(url, { waitUntil: "load", timeOut: 3000 });
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    const title = await $("[class='title']").text();

    const stops = await $("[class='stop-name']").text();

    const schedule = await $("[class='schedule-table']").text();

    const alternativeDirections = await $(
      "#main-content > section.content-section.lines > div > div.second-column.info-wrapper.lines-wrapper > div:nth-child(6) > div > ul > li > a"
    ).attr("href");

    const alternativeLines = $(
      "#main-content > section.content-section.lines > div > div.second-column.info-wrapper.lines-wrapper > div:nth-child(7) > div > ul > li > a "
    )
      .map((i, element) => {
        const hrefs = $(element).attr("href");

        return hrefs;
      })
      .get();

    const data = {
      title: title,
      stops: stops,
      alternativeLines: alternativeLines,
      alternativeDirections: alternativeDirections,
      schedule: schedule,
    };

    return data;
  } catch (error) {
    console.error(error);
  }
}

async function openPublicTransportLine(url, page) {
  try {
    await page.goto(url, { waitUntil: "networkidle2" });
    //await page.goto(url, { waitUntil: "load", timeOut: 3000 });
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    const links = await $("[href]")
      .map((i, element) => {
        const hrefs =
          "https://moovitapp.com/index/" + "en" + "/" + $(element).attr("href");

        return hrefs;
      })
      .get();

    var realLinks = links.filter((element) =>
      element.includes("/public_transit-line-")
    );

    return realLinks;
  } catch (error) {
    console.error(error);
  }
}

async function publicTransportForCity(url, page, countryCode) {
  try {
    await page.goto(url, { waitUntil: "networkidle2" });
    //await page.goto(url, { waitUntil: "load", timeOut: 3000 });
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    const links = await $("[class='agency-group']")
      .map((i, element) => {
        const hrefs =
          "https://moovitapp.com/index/" +
          countryCode +
          "/" +
          $(element).attr("href");

        return hrefs;
      })
      .get();

    var countries = links.filter((element) =>
      element.includes("/index/" + countryCode)
    );

    return links;
  } catch (error) {
    console.error(error);
  }
}

async function browseCities(url, page) {
  try {
    console.log("country url:", url);
    const countryCode = url.split("/");
    console.log("country code:", countryCode[countryCode.length - 2]);

    await page.goto(url, { waitUntil: "networkidle2" });
    //await page.goto(url, { waitUntil: "load", timeOut: 3000 });
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    const links = await $("[href]")
      .map((i, element) => {
        let manipulate = $(element).attr("href");
        manipulate = manipulate.slice(2);
        const hrefs = "https://moovitapp.com/index" + manipulate;

        return hrefs;
      })
      .get();

    var lines = links.filter((element) => element.split("/").length === 6);

    var cities = links.filter((element) =>
      element.includes("https://moovitapp.com/index/")
    );

    const data = {
      cities: cities,
      countryCode: countryCode,
    };

    return cities;
  } catch (error) {
    console.error(error);
  }
}

async function browseCountries(url, page) {
  try {
    await page.goto(url, { waitUntil: "networkidle2" });
    //await page.goto(url, { waitUntil: "load", timeOut: 3000 });
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    const links = await $("[href]")
      .map((i, element) => {
        const hrefs = "https://moovitapp.com" + $(element).attr("href");

        return hrefs;
      })
      .get();

    var countries = links.filter((element) => element.includes("/index/"));

    return countries;
  } catch (error) {
    console.error(error);
  }
}

async function main() {
  browser = await puppeteer.launch({ headless: false });
  const countriesPage = await browser.newPage();
  const citiesPage = await browser.newPage();
  const transportPage = await browser.newPage();
  const transportElementPage = await browser.newPage();
  const specificTransportElementPage = await browser.newPage();
  const countriesUrl =
    "https://moovitapp.com/index/tr/toplu_ta%C5%9F%C4%B1ma-countries";

  const countries = await browseCountries(countriesUrl, countriesPage);
  //console.log(countries);
  for (var i = 0; i < countries.length; i++) {
    const cities = await await browseCities(countries[i], citiesPage);
    //console.log(cities);

    for (var j = 0; j < cities.length; j++) {
      const publicTransport = await publicTransportForCity(
        cities[j],
        transportPage,
        "en"
      );
      //console.log("public transport: ", publicTransport);

      for (var t = 0; t < publicTransport.length; t++) {
        const lines = await openPublicTransportLine(
          publicTransport[t],
          transportElementPage
        );
        //console.log("details: ", lines);

        const details = await thatPublicLine(
          lines[0],
          specificTransportElementPage
        );
        console.log("details: ", details);
      }
    }
  }
}
main();
