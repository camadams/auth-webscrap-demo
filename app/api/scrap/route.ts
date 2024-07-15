import type { NextApiRequest, NextApiResponse } from "next";
import puppeteer from "puppeteer";
import cheerio from "cheerio";
import { NextResponse } from "next/server";

type Data = {
  spans: string[];
};

export async function GET(
  req: NextApiRequest,
  res: NextApiResponse<Data | { error: string }>
) {
  try {
    // const url = req.query.url as string;
    const url =
      "https://www.airbnb.co.za/s/Cape-Town--Western-Cape--South-Africa/homes?tab_id=home_tab&refinement_paths%5B%5D=%2Fhomes&monthly_start_date=2024-06-01&monthly_length=3&monthly_end_date=2024-09-01&price_filter_input_type=1&channel=EXPLORE&query=Cape%20Town%2C%20Western%20Cape&place_id=ChIJ1-4miA9QzB0Rh6ooKPzhf2g&date_picker_type=flexible_dates&flexible_trip_dates%5B%5D=october&flexible_trip_dates%5B%5D=september&adults=1&source=structured_search_input_header&search_type=user_map_move&search_mode=regular_search&price_filter_num_nights=28&ne_lat=-34.1022032339858&ne_lng=18.47622637502542&sw_lat=-34.10891042062033&sw_lng=18.46928919979797&zoom=16.51538932078821&zoom_level=16.51538932078821&search_by_map=true&price_max=8082&amenities%5B%5D=4&flexible_trip_lengths%5B%5D=one_month";

    // Launch a new browser instance
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(0);
    // Navigate to the URL
    await page.goto(url, { waitUntil: "networkidle2" });
    // await page.waitForNavigation({ waitUntil: "networkidle2" });

    // cam new
    // Extract quotes from the page
    // const res = await page.evaluate(() => {
    //   const spans = document.querySelectorAll("span[aria-hidden=true]");
    //   // return Array.from(spans).map((span) => {
    //   //   const textElement = span.querySelector(".text");
    //   //   const authorElement = span.querySelector(".author");

    //   //   const text = textElement ? textElement.innerText : "";
    //   //   const author = authorElement ? authorElement.innerText : "";

    //   //   return { text, author };
    //   // });
    //   return spans;
    // });
    //

    // new 2

    const hrefs = await page.evaluate(() => {
      let atags = document.querySelectorAll("a");
      const roomsLinks = Array.from(atags)
        .map((atag) => atag.href)
        .filter((href) => href.includes("/rooms/"));
      const uniqueRoomLinks = Array.from(new Set(roomsLinks));
      return uniqueRoomLinks;
    });

    //

    // Get the HTML content of the page
    // const html = await page.content();

    // // Close the browser
    await browser.close();

    // // Load the HTML content into cheerio
    // const cheerio = await import("cheerio");
    // const $ = cheerio.load(html);
    // console.log("line 40");

    // // Extract the desired data
    // const spans: string[] = [];
    // $("span[hidden-aria=true]").each((i, element) => {
    //   if (!$(element).attr("class")) {
    //     spans.push($(element).text());
    //   }
    // });

    // Respond with the extracted data
    console.log(hrefs);
    return NextResponse.json(hrefs, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error scraping data" }, { status: 500 });
  }
}
