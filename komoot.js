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

async function countPageOfGuides(url, page) {
  try {
    await page.goto(url, { waitUntil: "networkidle2" });
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    const countPages = await $("[href]")
      .map((i, element) => {
        const hrefs = $(element).attr("href") + "'";
        const hrefsMatch = hrefs.match(/(.*?)=\d+'/);
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

async function openStop(url, page) {
  try {
    await page.goto(url, { waitUntil: "networkidle2" });
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    const stopTitle = await $(
      "[class='tw-text-primary tw-text-2xl md:tw-text-3xl tw-font-bold tw-mb-0 tw-break-words']"
    ).text();

    const tips = await $("[class='tw-m-0  tw-border-black-10 ']").text();

    const more = await $("[class='tw-p-4 sm:tw-p-6']").text();

    const info = await $("[class='tw-mb-12']").text();

    const info2 = await $(
      "[class='tw-flex tw-justify-between tw-items-top']"
    ).text();

    const data = {
      title: stopTitle,
      url: url,
      tips: tips,
      info: info,
      extraInfo: info2,
      more: more,
    };
    return data;
  } catch (error) {
    console.error(error);
  }
}

async function openSmartTourAndFetchStops(url, page) {
  try {
    await page.goto(url, { waitUntil: "networkidle2" });
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    const highlights = await $("[href]")
      .map((i, element) => {
        const hrefs = $(element).attr("href") + "'";
        const hrefsMatch = hrefs.match(/highlight\/(.*?)\'/);
        arr = hrefsMatch;

        return hrefsMatch;
      })
      .get();

    var hl = highlights.filter(function (element, index, array) {
      return index % 2 === 0;
    });

    var hlx = hl.map((place) => place.slice(0, -1));

    var stops = hlx.map((guide) => "https://www.komoot.com/" + guide);

    return stops;
  } catch (error) {
    console.error(error);
  }
}

async function openSmartTour(url, page) {
  try {
    await page.goto(url, { waitUntil: "networkidle2" });
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    const smartTourTitle = await $("#title > div > h1 > span").text();

    const smartTourInfo = await $("[class='tw-mb-3 css-1v12pqe']").text();

    const smartTourStops = await $(
      "[class='c-link c-link--inherit js-highlight-card-title-link']"
    ).text();

    const smartTourStopsExtended = await $("[class='tw-mb-6']").text();

    const smartTourDistances = await $(
      "[class='tw-mt-1 tw-text-secondary']"
    ).text();

    const data = {
      title: smartTourTitle,
      info: smartTourInfo,
      distances: smartTourDistances,
      stops: smartTourStops,
      extended: smartTourStopsExtended,
    };

    return data;
  } catch (error) {
    console.error(error);
  }
}

async function browseThatGuide(url, page) {
  try {
    await page.goto(url, { waitUntil: "networkidle2" });
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    const smartTour = await $("[href]")
      .map((i, element) => {
        const hrefs = $(element).attr("href") + "'";
        const hrefsMatch = hrefs.match(/smarttour\/(.*?)\'/);
        arr = hrefsMatch;

        return hrefsMatch;
      })
      .get();

    var st = smartTour.filter(function (element, index, array) {
      return index % 2 === 0;
    });

    var stx = st.map((place) => place.slice(0, -1));

    var smartTrs = stx.map((guide) => "https://www.komoot.com/" + guide);

    return smartTrs;
  } catch (error) {
    console.error(error);
  }
}

async function getGuides(url, page) {
  try {
    await page.goto(url, { waitUntil: "networkidle2" });
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    const guideList = await $("[href]")
      .map((i, element) => {
        const hrefs = $(element).attr("href") + "'";
        const hrefsMatch = hrefs.match(/guide\/(.*?)\'/);
        arr = hrefsMatch;

        return hrefsMatch;
      })
      .get();

    const collectionList = await $("[href]")
      .map((i, element) => {
        const hrefs = $(element).attr("href") + "'";
        const hrefsMatch = hrefs.match(/collection\/(.*?)\'/);
        arr = hrefsMatch;

        return hrefsMatch;
      })
      .get();

    var gl = guideList.filter(function (element, index, array) {
      return index % 2 === 0;
    });

    var cl = collectionList.filter(function (element, index, array) {
      return index % 2 === 0;
    });

    var guidex = gl.map((place) => place.slice(0, -1));

    var collectionx = cl.map((place) => place.slice(0, -1));

    var guides = guidex.map((guide) => "https://www.komoot.com/" + guide);

    var collections = collectionx.map(
      (collection) => "https://www.komoot.com/" + collection
    );

    const data = {
      collections: collections,
      guides: guides,
    };

    return data;
  } catch (error) {
    console.error(error);
  }
}

async function getRoutesFromDiscover(url, page) {
  try {
    await page.goto(url, { waitUntil: "networkidle2" });
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    const routes = await $("[href]")
      .map((i, element) => {
        const hrefs = $(element).attr("href") + "'";
        const hrefsMatch = hrefs.match(
          /https:\/\/www.komoot.com\/discover\/(.*?)\'/
        );
        arr = hrefsMatch;

        return hrefsMatch;
      })
      .get();

    var ro = routes.filter(function (element, index, array) {
      return index % 2 === 0;
    });

    var routeList = ro.map((place) => place.slice(0, -1));

    return routeList;
  } catch (error) {
    console.error(error);
  }
}

async function gatherRoutes() {
  browser = await puppeteer.launch({ headless: false });
  const discoverUrl = "https://www.komoot.com/discover";
  const discoverPage = await browser.newPage();
  const guidesCountPage = await browser.newPage();
  const guidesPage = await browser.newPage();
  const thatGuidePage = await browser.newPage();
  const thatSmartTour = await browser.newPage();

  const routes = await getRoutesFromDiscover(discoverUrl, discoverPage);
  //console.log("routes: ", routes);

  const pages = await countPageOfGuides(routes[0], guidesCountPage);
  const splitted = pages[pages.length - 2].split("page=");
  const lastPage = splitted[1];
  const lastPageCount = parseInt(lastPage, 10);
  console.log("pages: ", lastPageCount);

  for (var x = 0; x <= routes.length; x++) {
    for (var i = 1; i <= lastPageCount; i++) {
      const guides = await getGuides(routes[x] + "?page=" + i, guidesPage);
      const data = {
        page: i,
        xcount: x,
        guidesandcollections: guides,
      };
      //console.log(data);
      //console.log("guides: ", data.guidesandcollections.guides);
      const listOfGuides = data.guidesandcollections.guides;

      for (var y = 0; y <= listOfGuides.length; y++) {
        const smartTours = await browseThatGuide(
          listOfGuides[y],
          thatGuidePage
        );
        const showData = {
          page: i,
          route: routes[x],
          guidesandcollections: guides,
          guide: listOfGuides[y],
          smartTours: smartTours,
        };

        //console.log(showData);
        for (var z = 0; z <= smartTours.length; z++) {
          const smartTour = await openSmartTour(smartTours[z], thatSmartTour);
          console.log("smart tour:", smartTour);
        }
      }
    }
  }
}

async function gatherRouteStops() {
  browser = await puppeteer.launch({ headless: false });
  const discoverUrl = "https://www.komoot.com/discover";
  const discoverPage = await browser.newPage();
  const guidesCountPage = await browser.newPage();
  const guidesPage = await browser.newPage();
  const thatGuidePage = await browser.newPage();
  const thatSmartTour = await browser.newPage();
  const stopPage = await browser.newPage();

  const routes = await getRoutesFromDiscover(discoverUrl, discoverPage);
  //console.log("routes: ", routes);

  const pages = await countPageOfGuides(routes[0], guidesCountPage);
  const splitted = pages[pages.length - 2].split("page=");
  const lastPage = splitted[1];
  const lastPageCount = parseInt(lastPage, 10);
  console.log("pages: ", lastPageCount);

  for (var x = 0; x <= routes.length; x++) {
    for (var i = 1; i <= lastPageCount; i++) {
      const guides = await getGuides(routes[x] + "?page=" + i, guidesPage);
      const data = {
        page: i,
        guidesandcollections: guides,
      };
      //console.log(data);
      //console.log("guides: ", data.guidesandcollections.guides);
      const listOfGuides = data.guidesandcollections.guides;

      for (var y = 0; y <= listOfGuides.length; y++) {
        const smartTours = await browseThatGuide(
          listOfGuides[y],
          thatGuidePage
        );
        const showData = {
          page: i,
          route: routes[x],
          guidesandcollections: guides,
          guide: listOfGuides[y],
          smartTours: smartTours,
        };

        //console.log(showData);
        for (var z = 0; z <= smartTours.length; z++) {
          const stops = await openSmartTourAndFetchStops(
            smartTours[z],
            thatSmartTour
          );
          //console.log("stops:", stops);
          for (var w = 0; w < stops.length; w++) {
            const stop = await openStop(stops[w], stopPage);
            console.log({
              pageCount: i,
              routeCount: x,
              smartTourCount: z,
              stopCount: w,
              stop: stop,
            });
          }
        }
      }
    }
  }
}

async function main() {
  //Gathering routes or gathering route details. Commented one passive now. Uncomment to active it.
  //gatherRoutes();
  gatherRouteStops();
}

main();
