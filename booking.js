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

let totalRes = 25;

//https://www.booking.com/searchresults.tr.html?aid=397594&label=gog235jc-1FCAEoggI46AdIM1gDaOQBiAEBmAEouAEHyAEM2AEB6AEB-AEMiAIBqAIDuALa69r4BcACAdICJDdjMDljMTBhLWExYzQtNDJiYy04NzYxLTZlMjk2OTFhNzlhZdgCBuACAQ&sid=a77b05690f436c2cb71f7ee46302a9af&sb=1&sb_lp=1&src=index&src_elem=sb&error_url=https%3A%2F%2Fwww.booking.com%2Findex.tr.html%3Faid%3D397594%3Blabel%3Dgog235jc-1FCAEoggI46AdIM1gDaOQBiAEBmAEouAEHyAEM2AEB6AEB-AEMiAIBqAIDuALa69r4BcACAdICJDdjMDljMTBhLWExYzQtNDJiYy04NzYxLTZlMjk2OTFhNzlhZdgCBuACAQ%3Bsid%3Da77b05690f436c2cb71f7ee46302a9af%3Bsb_price_type%3Dtotal%26%3B&ss=Wellington%2C+Wellington%2C+Yeni+Zelanda&is_ski_area=&checkin_year=2020&checkin_month=8&checkin_monthday=6&checkout_year=2020&checkout_month=8&checkout_monthday=7&group_adults=1&group_children=0&no_rooms=1&b_h4u_keep_filters=&from_sf=1&ss_raw=wellington&ac_position=0&ac_langcode=tr&ac_click_type=b&dest_id=-1521348&dest_type=city&iata=WLG&place_id_lat=-41.288605&place_id_lon=174.777328&search_pageview_id=72b442f3b7a80185&search_selected=true&search_pageview_id=72b442f3b7a80185&ac_suggestion_list_length=5&ac_suggestion_theme_list_length=0

async function scrapeHotelsInIndexPage(url, page) {
  try {
    //const page = await browser.newPage();
    await page.goto(url);
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    const totalResults = await $("#right > div > div > div > div > h1").text();

    const totalResultFind = await totalResults.match(/\d+/);

    if (totalResultFind) {
      const totalResultString = totalResultFind[0];

      const totalResultInteger = parseInt(totalResultString);

      totalRes = totalResultInteger;

      console.log("total results : ", totalResultInteger);
    }

    const hotels = $("[class='hotel_name_link url']")
      .map((i, element) => {
        const url = $(element).attr("href");
        const splitted = url.split("\n");
        return "https://booking.com" + splitted[1];
      })
      .get();
    return hotels;
  } catch (error) {
    console.error(error);
  }
}

async function scrapeDescriptionPage(url, page) {
  try {
    await page.goto(url, { waitUntil: "networkidle2" });
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);
    const pricePerNight = $(
      "#hprt-table > tbody > tr.hprt-table-cheapest-block.hprt-table-cheapest-block-fix.js-hprt-table-cheapest-block > td.d_pd_hp_price_left_align.hprt-table-cell.hprt-table-cell-price > div > div.prco-wrapper.bui-price-display.prco-sr-default-assembly-wrapper.prc-d-sr-wrapper > div.bui-price-display__value.prco-text-nowrap-helper.prco-font16-helper"
    ).text();

    const title = $("[class='hp__hotel-name']").text();

    const scores = $("[class='v2_review-scores__subscore ']").text();

    const reviewLong = $(
      "#left > div.hp-social_proof.reviews-snippet-sidebar.hp-social-proof-review_score > div > div > div.c-review-snippet__review > div > div:nth-child(1) > p"
    ).text();

    const description = $(
      "#hotel_main_content > div.hp_hotel_description_hightlights_wrapper > div.hotel_description_wrapper_exp.hp-description"
    ).text();

    const nearPlaces = $(
      "#blockdisplay1 > div:nth-child(2) > div.property_page_surroundings_block"
    ).text();

    const language = $(
      "#host-info > div.host-info-block-container.hops__personalised-description.js-host-info__description > p.js-host-info__languages"
    ).text();

    const facilities = $(
      "#hp_facilities_box > div.facilitiesChecklist > div"
    ).text();

    const keyPoints = $("#hotelPoliciesInc > div > p").text();

    const importantInfo = $(
      "#hp_important_info_box > div.imporant_info_highlight.hp-section > div"
    ).text();

    const data = {
      title: title,
      pricePerNight: pricePerNight,
      scores: scores,
      description: description,
      review: reviewLong,
      nearPlaces: nearPlaces,
      languageSpokenInHotel: language,
      facilities: facilities,
      keypoints: keyPoints,
      importantInfo: importantInfo,
    };

    //console.log(pricePerNight);
    return data;
  } catch (error) {
    console.error(error);
  }
}

async function openFetchedCityAndClick(url, page) {
  try {
    await page.goto(url, { waitUntil: "networkidle2" });
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    const linkToSeeAll = $(
      "[class='bui-button bui-button--wide bui-button--primary']"
    ).attr("href");

    return "https://www.booking.com" + linkToSeeAll;
  } catch (error) {
    console.error(error);
  }
}

async function fetchCitiesForCountry(url, page) {
  try {
    await page.goto(url, { waitUntil: "networkidle2" });
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    const links = await $("[href]")
      .map((i, element) => {
        const hrefs = "https://www.booking.com" + $(element).attr("href") + "'";
        const hrefsMatch = hrefs.match(
          /https:\/\/www.hostelworld.com\/hostels\/(.*?)\'/
        );
        arr = hrefsMatch;

        return hrefs;
      })
      .get();

    var filteredLinks = links.filter((element) =>
      element.startsWith(url + "/")
    );

    return filteredLinks;
  } catch (error) {
    console.error(error);
  }
}

async function main() {
  browser = await puppeteer.launch({ headless: false });
  const descriptionPage = await browser.newPage();
  const hotelsList = await browser.newPage();
  for (let index = 0; index < totalRes; index = index + 25) {
    const hotels = await scrapeHotelsInIndexPage(
      "https://www.booking.com/searchresults.tr.html?aid=397594&label=gog235jc-1FCAEoggI46AdIM1gDaOQBiAEBmAEouAEHyAEM2AEB6AEB-AEMiAIBqAIDuALa69r4BcACAdICJDdjMDljMTBhLWExYzQtNDJiYy04NzYxLTZlMjk2OTFhNzlhZdgCBuACAQ&sid=a77b05690f436c2cb71f7ee46302a9af&tmpl=searchresults&ac_click_type=b&ac_position=0&checkin_month=8&checkin_monthday=6&checkin_year=2020&checkout_month=8&checkout_monthday=7&checkout_year=2020&class_interval=1&dest_id=-1521348&dest_type=city&dtdisc=0&from_sf=1&group_adults=1&group_children=0&iata=WLG&inac=0&index_postcard=0&label_click=undef&no_rooms=1&postcard=0&raw_dest_type=city&room1=A&sb_price_type=total&search_selected=1&shw_aparth=1&slp_r_match=0&src=index&src_elem=sb&srpvid=32d04de6067201a0&ss=Wellington%2C%20Wellington%2C%20Yeni%20Zelanda&ss_all=0&ss_raw=wellington&ssb=empty&sshis=0&top_ufis=1&offset=" +
        index,
      hotelsList
    );
    console.log("index is: ", index);
    console.log("total number of results (index limit) is : ", totalRes);
    //console.log(hotels);

    for (var i = 0; i < hotels.length; i++) {
      const data = await scrapeDescriptionPage(hotels[i], descriptionPage);
      console.log(data);
      console.log("(inside) index is: ", index);
      console.log(
        "(inside) total number of results (index limit) is : ",
        totalRes
      );
      console.log("page: ", index, "hotel no: ", i);
    }
  }
}

async function mainAlternative() {
  browser = await puppeteer.launch({ headless: false });
  const citiesForCountryPage = await browser.newPage();
  const cityPageFirst = await browser.newPage();
  const descriptionPage = await browser.newPage();
  const hotelsList = await browser.newPage();
  const cityCodes = [
    "af",
    "al",
    "dz",
    "ad",
    "ao",
    "ai",
    "ag",
    "ar",
    "am",
    "aw",
    "au",
    "at",
    "az",
    "bs",
    "bh",
    "bd",
    "bb",
    "by",
    "be",
    "bz",
    "bj",
    "bm",
    "bt",
    "bo",
    "bq",
    "ba",
    "bw",
    "br",
    "bn",
    "bg",
    "bf",
    "bi",
    "cv",
    "kh",
    "cm",
    "ca",
    "ky",
    "cf",
    "td",
    "cl",
    "cn",
    "cx",
    "cc",
    "co",
    "km",
    "cd",
    "cg",
    "ck",
    "cr",
    "hr",
    "cu",
    "cw",
    "cy",
    "cz",
    "ci",
    "dk",
    "dj",
    "dm",
    "do",
    "ec",
    "eg",
    "sv",
    "gq",
    "er",
    "ee",
    "sz",
    "et",
    "fk",
    "fo",
    "fj",
    "fi",
    "fr",
    "gf",
    "pf",
    "tf",
    "ga",
    "gm",
    "ge",
    "de",
    "gh",
    "gi",
    "gr",
    "gl",
    "gd",
    "gp",
    "gu",
    "gt",
    "gg",
    "gn",
    "gw",
    "gy",
    "ht",
    "hm",
    "va",
    "hn",
    "hk",
    "hu",
    "jm",
    "jp",
    "je",
    "jo",
    "kz",
    "ke",
    "ki",
    "kp",
    "kr",
    "kw",
    "kg",
    "la",
    "lv",
    "lb",
    "ls",
    "lr",
    "ly",
    "lt",
    "li",
    "lu",
    "mo",
    "mg",
    "mw",
    "my",
    "mv",
    "ml",
    "mt",
    "mh",
    "mq",
    "mr",
    "mu",
    "yt",
    "mx",
    "fm",
    "md",
    "mc",
    "mn",
    "me",
    "ms",
    "ma",
    "mz",
    "mm",
    "na",
    "nr",
    "np",
    "nl",
    "nc",
    "nz",
    "ni",
    "ne",
    "ng",
    "nu",
    "nf",
    "mp",
    "no",
    "om",
    "pk",
    "pw",
    "ps",
    "pa",
    "pg",
    "py",
    "pe",
    "ph",
    "pn",
    "pl",
    "pt",
    "pr",
    "qa",
    "mk",
    "ro",
    "ru",
    "rw",
    "re",
    "bl",
    "sh",
    "kn",
    "lc",
    "mf",
    "pm",
    "vc",
    "ws",
    "sm",
    "st",
    "sa",
    "sn",
    "rs",
    "sc",
    "sl",
    "sg",
    "sx",
    "sk",
    "si",
    "sb",
    "so",
    "za",
    "gs",
    "ss",
    "es",
    "lk",
    "sd",
    "sr",
    "sj",
    "se",
    "ch",
    "sy",
    "tw",
    "tj",
    "tz",
    "th",
    "tl",
    "th",
    "tk",
    "to",
    "tt",
    "tn",
    "tr",
    "tm",
    "tc",
    "tv",
    "ug",
    "ua",
    "ae",
    "gb",
    "um",
    "us",
    "uy",
    "uz",
    "vu",
    "ve",
    "vn",
    "vg",
    "vi",
    "wf",
    "eh",
    "ye",
    "zm",
    "zw",
    "ax",
    "is",
    "in",
    "id",
    "ir",
    "iq",
    "ie",
    "im",
    "il",
    "it",
  ];
  for (var y = 0; y < cityCodes.length; y++) {
    const url = "https://www.booking.com/city/" + cityCodes[y];
    const cities = await fetchCitiesForCountry(url, citiesForCountryPage);
    //console.log(cities);
    for (var x = 0; x < cities.length; x++) {
      const seeAll = await openFetchedCityAndClick(cities[x], cityPageFirst);
      //console.log(seeAll);
      for (let index = 0; index < totalRes; index = index + 25) {
        const hotels = await scrapeHotelsInIndexPage(
          seeAll + "offset=" + index,
          hotelsList
        );
        console.log("index is: ", index);
        console.log("total number of results (index limit) is : ", totalRes);
        console.log("total cities found: ", cities.length);

        //console.log(hotels);

        for (var i = 0; i < hotels.length; i++) {
          const data = await scrapeDescriptionPage(hotels[i], descriptionPage);
          console.log(data);
          console.log("(inside) index is: ", index);
          console.log(
            "(inside) total number of results (index limit) is : ",
            totalRes
          );
          console.log("page: ", index, "hotel no: ", i);
        }
      }
    }
  }
}

//main();
mainAlternative();
