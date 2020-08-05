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

let totalCount = 0;

async function lookPage(url, page) {
  await page.goto(url, { waitUntil: "networkidle2" });
  const html = await page.evaluate(() => document.body.innerHTML);
  const $ = await cheerio.load(html);

  const title = await $("[itemprop='name']").text();
  const score = await $("[class='ball']").text();
  const mapInfo = await $("body > main > div > section > div").text();

  const features = await $(
    "body > main > div > section > div:nth-child(4)"
  ).text();

  const reviews = await $(
    "body > main > div > section > div:nth-child(5)"
  ).text();

  const similarPlaces = await $(
    "body > main > div > section > div.mm-cat--items > div"
  ).text();

  const data = {
    title: title,
    score: score,
    features: features,
    reviews: reviews,
    similarPlaces: similarPlaces,
    mapInfo: mapInfo,
  };

  return data;
}

async function selectFromCatalog(url, page) {
  try {
    await page.goto(url, { waitUntil: "networkidle2" });
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);
  } catch (error) {
    console.error(error);
  }
}

async function visitCatalog(url, page) {
  try {
    await page.goto(url, { waitUntil: "networkidle2" });
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    const catalogElements = await $("[href]")
      .map((i, element) => {
        const hrefs = $(element).attr("href") + "'";
        const hrefsMatch = hrefs.match(/catalog\/(.*?)\'/);
        arr = hrefsMatch;

        return hrefsMatch;
      })
      .get();

    var cg = catalogElements.filter(function (element, index, array) {
      return index % 2 === 0;
    });

    var catalogElement = cg.map((place) => place.slice(0, -1));

    var el = catalogElement.map((element) => "https://maps.me/" + element);

    var catalement = el.filter((element) => element.split("/").length > 7);

    return catalement;
  } catch (error) {
    console.error(error);
  }
}

async function countPageOfGuides(url, page) {
  try {
    await page.goto(url, { waitUntil: "networkidle2" });
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    const countPages = await $("[href]")
      .map((i, element) => {
        const hrefs = $(element).attr("href") + "'";
        const hrefsMatch = hrefs.match(/(.*?)page=\d+'/);
        arr = hrefsMatch;

        return hrefsMatch;
      })
      .get();

    var cp = countPages.filter(function (element, index, array) {
      return index % 2 === 0;
    });

    var count = cp.map((place) => place.slice(0, -1));

    return count;
  } catch (error) {
    console.error(error);
  }
}

async function browseCatalog(url, page) {
  try {
    await page.goto(url, { waitUntil: "networkidle2" });
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    const catalog = await $("[href]")
      .map((i, element) => {
        const hrefs = $(element).attr("href") + "'";
        const hrefsMatch = hrefs.match(/catalog\/(.*?)\'/);
        arr = hrefsMatch;

        return hrefsMatch;
      })
      .get();

    var cg = catalog.filter(function (element, index, array) {
      return index % 2 === 0;
    });

    /*
    var cg = cga.filter(function (element, index, array) {
      return index !== 0 && index !== 1;
    });

    */

    var catalogx = cg.map((place) => place.slice(0, -1));

    var catalogs = catalogx.map((element) => "https://maps.me/" + element);

    var catagoe = catalogs.filter((element) => element.split("/").length > 6);

    return catagoe;
  } catch (error) {
    console.error(error);
  }
}

async function main() {
  browser = await puppeteer.launch({ headless: false });
  const discoverUrl = "https://maps.me/#gsc.tab=0";
  const discoverPage = await browser.newPage();
  const catalogCountPage = await browser.newPage();
  const catalogPage = await browser.newPage();
  const placePage = await browser.newPage();

  const catalog = await browseCatalog(discoverUrl, discoverPage);
  console.log("catalog: ", catalog);

  const pages = await countPageOfGuides(catalog[0], catalogCountPage);
  const splitted = pages[pages.length - 3].split("page=");
  const lastPage = splitted[1];
  const lastPageCount = parseInt(lastPage, 10);

  for (var j = 0; j < catalog.length; j++) {
    for (var i = 1; i <= lastPageCount; i++) {
      const catalogElements = await visitCatalog(
        catalog[j] + "?page=" + i,
        catalogPage
      );
      /*
      console.log({
        pageCount: i,
        elementCount: j,
        catalogElements: catalogElements,
      });
      */
      for (var k = 0; k < catalogElements.length; k++) {
        const details = await lookPage(catalogElements[k], placePage);
        console.log({
          count: totalCount,
          pageCount: i,
          elementCount: j,
          placeCount: k,
          url: catalogElements[k],
          category: catalog[j],
          place: details,
        });

        totalCount = totalCount + 1;
      }
    }
  }
}

main();
