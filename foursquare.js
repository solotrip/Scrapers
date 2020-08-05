const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const cheerio2 = require("cheerio");

const sample = {
  guests: 1,
  bedrooms: 1,
  beds: 1,
  baths: 1,
  pesosPerNight: 350,
};

let arr = [];

let browser;

//https://tr.foursquare.com/explore?mode=url&near=Yeni%20Zelanda&nearGeoId=72057594040114160

async function createPageAndClickButton(url) {
  try {
    let page = await browser.newPage();
    await page.goto(url);
    let places;
    await page
      .click('button[class="blueButton"]')
      .then((places = await scrapePlacesInIndexPage(page)));

    console.log("Button clicked and loaded more places.");

    return places;
  } catch (error) {
    console.error(error);
  }
}

async function scrapePlacesInIndexPage(html) {
  try {
    //let html = await page.evaluate(() => document.body.innerHTML);

    let $ = await cheerio.load(html);

    const places = await $("[href]")
      .map((i, element) => {
        const hrefs = $(element).attr("href") + "'";
        const hrefsMatch = hrefs.match(/\/v\/(.*?)\'/);
        arr = hrefsMatch;

        return arr;
      })
      .get();
    //console.log(places);
    //to solve repetition of regex array, we just make use of even index elements.
    var uniquePlaces = places.filter(function (element, index, array) {
      return index % 2 === 0;
    });

    //Quotation marks at the end is removed from each element.
    var finalPlaces = uniquePlaces.map(
      (place) => "https://foursquare.com" + place.slice(0, -1)
    );

    //console.log("button", await $("button[class='blueButton']").text());
    //console.log("updated length of the places: ", finalPlaces.length);
    return finalPlaces;
  } catch (error) {
    console.error(error);
  }
}

async function scrapeDescriptionPage(url, page) {
  try {
    await page.goto(url);
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);
    const ratingOutOf10 = $("[itemprop='ratingValue']").text();
    const name = $("[itemprop='name']").text();
    const category = $("[class='unlinkedCategory']").text();
    const venueCity = $("[class='venueCity']").text();
    const openHours = $("[class='open']").text();
    const instagramPage = $("[class='instagramPageLink']").text();
    const twitterPage = $("[class='twitterPageLink']").text();
    const facebookPage = $("[class='facebookPageLink']").text();
    const website = $("[itemprop='url']").text();
    const priceRange = $("[itemprop='priceRange']").text();
    const phoneNumber = $("[itemprop='telephone']").text();
    const relatedVenue = $("[class='relatedVenueWithTip']").text();
    const nextStops = $("[data-listtype='subsequent_venues']").text();

    /*
    console.log("name of the place: ", name);
    console.log("rating: ", ratingOutOf10);
    console.log("price: ", priceRange);
    console.log("category: ", category);
    console.log("venue city: ", venueCity);
    console.log(openHours);
    console.log("instagram: ", instagramPage);
    console.log("website: ", website);
    console.log("twitter: ", twitterPage);
    console.log("facebook:", facebookPage);
    console.log("Phone: ", phoneNumber);
    console.log("Related: ", relatedVenue);
    console.log("Next stops: ", nextStops);
    */

    const data = {
      title: name,
      rating: ratingOutOf10,
      price: priceRange,
      category: category,
      venue: venueCity,
      openHours: openHours,
      relatedVenues: relatedVenue,
      nextStops: nextStops,
      instagram: instagramPage,
      website: website,
      twitter: twitterPage,
      facebook: facebookPage,
      phone: phoneNumber,
    };

    return data;
  } catch (error) {
    console.error(error);
  }
}

async function main() {
  browser = await puppeteer.launch({ headless: false });

  //Remembering the place with saving the i on count holder.
  let countHolder = 0;

  //whether the load more places button clicked or not.
  let loadedMore = false;

  const descriptionPage = await browser.newPage();

  //Another loop should be there. ( it might be while loop.)

  let page = await createPageAndClickButton(
    "https://tr.foursquare.com/explore?mode=url&near=eskisehir"
  );

  let places = await page;

  let startIndex = 0;

  if (loadedMore) {
    startIndex = countHolder;
  }

  for (var i = startIndex; i < places.length; i++) {
    console.log("places length:", places.length);
    await scrapeDescriptionPage(places[i], descriptionPage);

    console.log("place: ", i);
    if (i === places.length - 1) {
      console.log("last place.");

      //since the button is clicked, change the status of loadedMore Boolean.
      loadedMore = true;

      //Saving the last value of count i.
      countHolder = i;
    }
  }

  //console.log(places);
}

async function getListOfCities(url, page) {
  try {
    await page.goto(url, { waitUntil: "networkidle2" });
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    const citiesList = $(
      "#mw-content-text > div > table > tbody > tr > td:nth-child(1) > a"
    )
      .map((i, element) => {
        const hrefs = $(element).attr("title");
        const hrefsMatch = hrefs.match(
          /https\:\/\/en.wikipedia.org\/wiki\/List_of_cities_in(.*?)\'/
        );
        arr = hrefsMatch;

        return hrefs;
      })
      .get();

    return citiesList;
  } catch (error) {
    console.error(error);
  }
}

async function visitThatCityPage(url, page) {
  try {
    await page.goto(url, { waitUntil: "networkidle2" });
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    const style = $('button[class="blueButton"]').attr("style");

    let basicCounter = 0;

    while (style === undefined && basicCounter < 10) {
      await page.click('button[class="blueButton"]');
      await page.waitFor(1000);
      basicCounter = basicCounter + 1;
    }
    await page.waitFor(10000);
  } catch (error) {
    console.error(error);
  }
}

async function mainAlternative() {
  browser = await puppeteer.launch({ headless: false });

  const letters = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
  ];
  const citiesUrl =
    "https://en.wikipedia.org/wiki/List_of_towns_and_cities_with_100,000_or_more_inhabitants/cityname:_";
  //const countriesPage = await browser.newPage();
  const citiesPage = await browser.newPage();
  const thatCityPage = await browser.newPage();
  //const wikiPage = await browser.newPage();
  const descriptionPage = await browser.newPage();

  for (var i = 0; i < letters.length; i++) {
    const cities = await getListOfCities(citiesUrl + letters[i], citiesPage);
    //console.log(cities);
    for (var j = 0; j < cities.length; j++) {
      await visitThatCityPage(
        "https://tr.foursquare.com/explore?mode=url&near=" + cities[j],
        thatCityPage
      );
      await thatCityPage.waitFor(10000);
      //We are going to scrape each place from that point on.
      const html = await thatCityPage.evaluate(() => document.body.innerHTML);
      const places = await scrapePlacesInIndexPage(html);
      //console.log("places:", places);

      //Go to each place detail page.
      for (var t = 0; t < letters.length; t++) {
        const details = await scrapeDescriptionPage(places[t], descriptionPage);
        console.log({ places: details });
      }
    }
  }
}

//main();

mainAlternative();
