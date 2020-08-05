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

let totalRes = 20;

async function scrapeHomesIndexPage(url, page) {
  try {
    await page.goto(url, { waitUntil: "networkidle2" });
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    const totalResults = $(
      "#ExploreLayoutController > div > div > div > div > section > div"
    ).text();

    const totalResultFind = await totalResults.match(/\d+/);

    const totalResultString = totalResultFind[0];

    const totalResultInteger = parseInt(totalResultString);

    totalRes = totalResultInteger;

    const homes = $("[itemprop='url']")
      .map((i, element) => {
        const url = $(element).attr("content");
        //I get undefined or null at the airbnb.com in content url for some reason, so I'll just take the end part
        const splitted = url.split("rooms");
        return "https://airbnb.com/rooms" + splitted[1];
      })
      .get();

    console.log("total results: ", totalResultInteger);
    console.log(homes);
    return homes;
  } catch (err) {
    console.error("Error scraping homes page");
    console.error(err);
  }
}

async function scrapeDescriptionPage(url, page) {
  try {
    await page.goto(url, { waitUntil: "networkidle0" });
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);
    const pricePerNight = $(
      "#site-content > div > div > div > div > div > div > div:nth-child(1) > div > div > div > div > div:nth-child(1) > div > div > div > div > span > span"
    ).text();

    const roomText = await $("#site-content > div").text();

    const priceMatches = await roomText.match(/\d+ +\p{Sc}/);

    const reviews = await $(
      "#site-content > div > div > div > div > div > div> div > div > div > div > div > div > span > div > span"
    ).text();

    const description = await $(
      "[data-section-id='DESCRIPTION_DEFAULT']"
    ).text();

    const title = await $("[data-section-id='TITLE_DEFAULT']").text();

    const score = await title.match(/\d+,\d+/);

    let scoreToShow;
    if (score === null) {
      scoreToShow = "0";
    } else {
      scoreToShow = score[0];
    }

    let priceAllowed = "N/A";

    if (priceMatches && priceMatches.length > 0) {
      priceAllowed = priceMatches[0];
    }

    console.log("price pr. night normal;");
    console.log(pricePerNight);
    //console.log(roomText);
    //console.log("price per night from regex;");
    //console.log(priceAllowed);

    const data = {
      title: title,
      pricePerNight: pricePerNight,
      score: scoreToShow,
      reviews: reviews,
      description: description,
    };

    return data;
  } catch (err) {
    console.error("error scraping description page");
    console.error(err);
  }
}

async function openEachSiteMapElement(url, page) {
  try {
    await page.goto(url, { waitUntil: "networkidle2" });
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    const elo = await $("body > div > div > div > div > div > div > a").attr(
      "href"
    );

    return "https://www.airbnb.com.tr" + elo;
  } catch (error) {
    console.error(error);
  }
}

async function getFromSiteMap(url, page) {
  try {
    await page.goto(url, { waitUntil: "networkidle2" });
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    const all = await $("[href]")
      .map((i, element) => {
        const hrefs =
          "https://www.airbnb.com.tr" + $(element).attr("href") + "'";
        const hrefsMatch = hrefs.match(/(.*?)\/stays'/);
        arr = hrefsMatch;

        return hrefsMatch;
      })
      .get();

    var allsite = all.filter(function (element, index, array) {
      return index % 2 === 0 && index !== 0;
    });

    var sitemap = allsite.map((place) => place.slice(0, -1));

    return sitemap;
  } catch (error) {
    console.error(error);
  }
}

//Fetching home price per night from Airbnb.
async function fetchAirbnb() {
  browser = await puppeteer.launch({ headless: false });
  const homesIndexPage = await browser.newPage();

  for (let index = 0; index <= totalRes; index = index + 20) {
    //It's important to have a date selected to get prices in Airbnb
    const homes = await scrapeHomesIndexPage(
      "https://www.airbnb.com.tr/s/Wellington--New-Zealand/homes?federated_search_session_id=eb9bee6b-df13-47cf-83bb-f3392640c38e&query=Wellington%2C%20New%20Zealand&selected_tab_id=home_tab&search_type=pagination&s_tag=9E4kDUxC&tab_id=home_tab&checkin=2019-09-02&refinement_paths%5B%5D=%2Fhomes&screen_size=large&checkout=2019-09-06&place_id=ChIJy3TpSfyxOG0RcLQTomPvAAo&items_offset=" +
        index,
      homesIndexPage
    );

    console.log("index is: ", index);
    console.log("total number of results (index limit) is : ", totalRes);

    const descriptionPage = await browser.newPage();

    for (var i = 0; i < homes.length; i++) {
      await scrapeDescriptionPage(homes[i], descriptionPage);
    }
    console.log(homes);
  }
}

async function alternativeMain() {
  browser = await puppeteer.launch({ headless: false });

  const indexPage = await browser.newPage();
  const clickShowAllPage = await browser.newPage();
  const homesIndexPage = await browser.newPage();
  const descriptionPage = await browser.newPage();

  const url = "https://www.airbnb.com.tr/sitemaps/v2/destinations-L1-";

  for (var i = 0; i < 1996; i++) {
    const siteMapElements = await getFromSiteMap(url + i, indexPage);
    //console.log(siteMapElements);
    for (var j = 0; j < siteMapElements.length; j++) {
      const siteMapElementToClick = await openEachSiteMapElement(
        siteMapElements[j],
        clickShowAllPage
      );
      /*
      for (var t = 0; t < siteMapElements.length; t++) {
        console.log(siteMapElementToClick + "&items_offset=20");
      }
      */

      for (let index = 0; index <= totalRes; index = index + 20) {
        //It's important to have a date selected to get prices in Airbnb
        const homes = await scrapeHomesIndexPage(
          siteMapElementToClick + "&items_offset=" + index,
          homesIndexPage
        );

        console.log("index is: ", index);
        console.log("total number of results (index limit) is : ", totalRes);
        console.log("homes: ", homes);

        for (var x = 0; x < homes.length; x++) {
          const details = await scrapeDescriptionPage(
            homes[x],
            descriptionPage
          );
          console.log(details);
        }
        console.log(homes);
      }
    }
  }
}

//fetchAirbnb();
alternativeMain();
