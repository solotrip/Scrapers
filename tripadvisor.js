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

async function scrapeHotelsInIndexPage(url) {
  try {
    const page = await browser.newPage();
    await page.goto(url);
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    const totalResults = await $("[class='pageNumbers']").text();

    console.log("total results: ", totalResults);

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

    console.log(pricePerNight);
  } catch (error) {
    console.error(error);
  }
}

async function main() {
  browser = await puppeteer.launch({ headless: false });
  const descriptionPage = await browser.newPage();
  for (let index = 0; index <= 100; index = index + 30) {
    const hotels = await scrapeHotelsInIndexPage(
      "https://www.tripadvisor.com.tr/Search?q=wellington&searchSessionId=1DD6B054E480B5160B840D76293E6A281595357804065ssid&searchNearby=false&sid=793FA7935833768211A1CE8AA72C3CC91595357810284&blockRedirect=true&ssrc=e&rf=5&o=" +
        index
    );
    console.log("index is: ", index);
    console.log("total number of results (index limit) is : ", totalRes);

    for (var i = 0; i < hotels.length; i++) {
      await scrapeDescriptionPage(hotels[i], descriptionPage);
    }

    console.log(hotels);
  }
}

main();
