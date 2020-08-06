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

async function findQuickInfo(url, page) {
  try {
    //const page = await browser.newPage();
    //await page.goto(url, { waitUntil: "networkidle0" });
    await page.goto(url, { waitUntil: "load", timeOut: 3000 });
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    const quickInfo = await $("[class='blue bold' ]").text();
    await console.log("quick info:", quickInfo);

    const data = {
      quickInfo: quickInfo,
    };
    return data;
  } catch (error) {
    console.error(error);
  }
}

async function main() {
  browser = await puppeteer.launch({ headless: false });

  const cityPage = await browser.newPage();

  const client = await cityPage.target().createCDPSession();

  cities = [
    "istanbul",
    "ankara",
    "izmir",
    "kiev",
    "odessa",
    "lviv",
    "antalya",
    "newyork",
    "trabzon",
    "adana",
    "london",
    "los-angeles",
    "gaziantep",
    "dubai",
    "miami",
    "kayseri",
    "paris",
    "mugla",
    "amsterdam",
    "bangkok",
    "ordu-giresun",
    "samsun",
    "dalaman",
    "lefkosa",
    "erzurum",
    "dusseldorf",
    "barcelona",
    "hatay",
    "san-francisco",
    "milan",
    "berlin",
    "munich",
    "frankfurt",
    "diyarbakir",
    "konya",
    "sanliurfa",
    "malatya",
    "vienna",
    "washington-dc",
    "tokyo",
    "stuttgart",
    "van",
    "toronto",
    "brussels",
    "rome",
    "nevsehir",
    "denizli",
    "sivas",
    "chicago",
    "mardin",
    "elazig",
    "adiyaman",
    "kars",
    "tehran",
    "hong-kong",
    "zurich",
    "boston",
    "geneva",
    "baku",
    "cologne",
    "maldives",
    "guangzhou",
    "houston",
    "batman",
    "moscow",
    "shangai",
    "seoul",
    "bologna",
    "singapore",
    "lisbon",
    "alanya",
    "athens",
    "kahramanmaras",
    "venice",
    "budapest",
    "hannover",
    "madrid",
    "tel-aviv",
    "sarajevo",
    "atlanta",
    "cairo",
    "hamburg",
    "prague",
    "nice",
    "tashkent",
    "basel",
    "casablanca",
    "belgrade",
    "havana",
    "agri",
    "igdir",
    "nuremberg",
    "sinop",
    "sirnak",
    "manchester",
    "lyon",
    "erzincan",
    "johannesburg",
    "malta",
    "amasya",
    "ashgabat",
    "kuala-lumpur",
    "tbilisi",
    "stockholm",
    "bucharest",
    "montreal",
    "helsinki",
    "mus",
    "sofia",
    "jeddah",
    "bingol",
    "riyadh",
    "skopje",
    "dublin",
    "copenhagen",
    "malaga",
    "cape-town",
    "almaty",
    "warsaw",
    "beirut",
    "sao-paulo",
    "seychelles",
    "isparta",
    "tunis",
    "kuwait",
    "delhi",
    "podgorica",
    "erbil",
    "doha",
    "naples",
    "edinburgh",
    "minsk",
    "bishkek",
    "manilla",
    "birmingham",
    "valencia",
    "ljubljana",
    "phuket",
    "jakarta",
    "mumbai",
    "amman",
    "catania",
    "dhaka",
    "marseille",
    "beijing",
    "oslo",
    "algiers",
    "tabriz",
    "salzburg",
    "thessaloniki",
    "batumi",
    "taipei",
    "prishtina",
    "kastamonu",
    "tirana",
    "bremen",
    "kutahya",
    "dar-es-salaam",
    "tallinn",
    "porto",
    "colombo",
    "gothenburg",
    "st-petersburg",
  ];

  for (var i = 0; i < cities.length; i++) {
    const quicks = await findQuickInfo(
      "https://www.turkishairlines.com/en-my/flights/flights-to-" + cities[i],
      cityPage
    );
    console.log(quicks);
    await client.send("Network.clearBrowserCookies");
    await client.send("Network.clearBrowserCache");

    //await cityPage.waitFor(10000);
  }
}

main();
