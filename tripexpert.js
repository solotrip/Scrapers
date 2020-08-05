const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

let browser;

async function visitPlaceDetails(url, page) {
  try {
    page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    const placeTitle = await $(
      "body > section > div > div > div > div > div > h1"
    ).text();

    const score = await $(
      "body > section > div > div > div.listings.fleft.clearfix > div.hotel.clearfix > div > span"
    ).text();

    const reviews = await $("[itemprop='description']").text();

    const address = await $(
      "body > section > div > div > div > address > p > a"
    ).text();

    const phone = await $(
      "body > section > div > div > div.filters.fright.clearfix > address > em"
    ).text();
    await page.close();

    const data = {
      title: placeTitle,
      score: score,
      reviews: reviews,
      address: address,
      phone: phone,
    };

    return data;
  } catch (error) {
    console.error(error);
  }
}

function extractItems() {
  const extractedItems = Array.from(
    //document.querySelectorAll(
    //  "body > section > div > div > ul > li > div.destinations_body > div > div > div > div > h4 > a"
    //)

    document.querySelectorAll("body > section > div > div > ul > li > div > a")
  );

  items = extractedItems.map((element) => {
    const data = {
      title: element.innerText,
      url: element.href,
    };
    //return data;
    return element.href;
  });

  return items;
}

function extractElements() {
  const extractedItems = Array.from(
    //document.querySelectorAll(
    //  "body > section > div > div > ul > li > div.destinations_body > div > div > div > div > h4 > a"
    //)

    document.querySelectorAll(
      "body > section > div > div > div > div > div > div > h2 > a"
    )
  );

  items = extractedItems.map((element) => {
    const data = {
      title: element.innerText,
      url: element.href,
    };
    //return data;
    return element.href;
  });

  return items;
}

async function scrapeEachItem(
  url,
  page,
  extractElements,
  targetElementCount,
  delay = 1000
) {
  let items = [];
  page = await browser.newPage();
  try {
    await page.goto(url, { waitUntil: "networkidle2" });
    let previousHeight;
    while (true) {
      //while (items.length < targetElementCount) {
      items = await page.evaluate(extractElements);
      currentItemsLenght = items.length;
      previousHeight = await page.evaluate("document.body.scrollHeight");
      await page.evaluate("window.scrollTo(0,document.body.scrollHeight)");
      await page.waitForFunction(
        `document.body.scrollHeight > ${previousHeight}`
      );

      console.log(currentItemsLenght, " places  found for city: ", url);

      await page.waitFor(delay);
    }
  } catch (error) {
    console.error(error);
  }

  return items;
}

async function scrapeInfiniteScrollItems(
  page,
  extractItems,
  targetItemCount,
  delay = 1000
) {
  let items = [];
  page = await browser.newPage();
  page.setViewport({ width: 1280, height: 926 });

  await page.goto("https://www.tripexpert.com/destinations");

  try {
    let previousHeight;
    let currentItemsLenght;

    while (items.length < targetItemCount) {
      //instead of while true previouscount < currentcount
      //while (true) {
      items = await page.evaluate(extractItems);
      currentItemsLenght = items.length;
      previousHeight = await page.evaluate("document.body.scrollHeight");
      await page.evaluate("window.scrollTo(0,document.body.scrollHeight)");
      await page.waitForFunction(
        `document.body.scrollHeight > ${previousHeight}`
      );

      console.log("cities found: ", currentItemsLenght);

      await page.waitFor(delay);

      //Each item function
      //await scrapeEachItem(items[0], itemPage);
    }
  } catch (error) {
    console.error(error);
  }

  return items;
}

async function main() {
  browser = await puppeteer.launch({ headless: false });

  let page;
  let itemPage;
  let placePage;

  const targetItemCount = 1300;

  const targetElementCount = 100; // per page

  //const result = await page.evaluate(extractItems);

  // console.log(result);

  const items = await scrapeInfiniteScrollItems(
    page,
    extractItems,
    targetItemCount
  );

  await console.log(("items", items));

  // After loading all items;

  for (var i = 0; i < items.length; i++) {
    const places = await scrapeEachItem(
      items[i],
      itemPage,
      extractElements,
      targetElementCount
    );

    //await console.log("places: ", places);
    //Here we will go to place.

    for (var j = 0; j < places.length; j++) {
      const details = await visitPlaceDetails(places[j], placePage);
      console.log("place: ", details);
    }
  }
}
main();
