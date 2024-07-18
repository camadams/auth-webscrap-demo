"use server";
// import puppeteer from "puppeteer";
import chromium from "chrome-aws-lambda";
import axios from "axios";
import cheerio from "cheerio";
export async function scrap(_: any, formData: FormData) {
  try {
    const url =
      "https://www.airbnb.co.za/s/Cape-Town--Western-Cape--South-Africa/homes?tab_id=home_tab&refinement_paths%5B%5D=%2Fhomes&monthly_start_date=2024-06-01&monthly_length=3&monthly_end_date=2024-09-01&price_filter_input_type=1&channel=EXPLORE&query=Cape%20Town%2C%20Western%20Cape&place_id=ChIJ1-4miA9QzB0Rh6ooKPzhf2g&date_picker_type=flexible_dates&flexible_trip_dates%5B%5D=october&flexible_trip_dates%5B%5D=september&adults=1&source=structured_search_input_header&search_type=user_map_move&search_mode=regular_search&price_filter_num_nights=28&ne_lat=-34.1022032339858&ne_lng=18.47622637502542&sw_lat=-34.10891042062033&sw_lng=18.46928919979797&zoom=16.51538932078821&zoom_level=16.51538932078821&search_by_map=true&price_max=8082&amenities%5B%5D=4&flexible_trip_lengths%5B%5D=one_month";

    // Fetch the HTML content of the webpage
    const response = await axios.get(url);
    const html = response.data;

    // Load the HTML content into cheerio
    const $ = cheerio.load(html);

    // Extract the desired data
    const roomLinks: string[] = [];
    $("a").each((i, element) => {
      roomLinks.push($(element).attr("href") ?? "");
    });

    console.log(roomLinks);
    // const roomLinks = await page.evaluate(() => {
    //   const anchorTags = document.querySelectorAll("a");
    //   const hrefs = Array.from(anchorTags)
    //     .map((anchor) => anchor.href)
    //     .filter((href) => href.includes("/rooms/"));
    //   return Array.from(new Set(hrefs)); // Remove duplicate links
    // });

    return { res: roomLinks };
  } catch (error) {
    console.error("Error scraping Airbnb URL:", error);
    return { error: "Failed to scrape the Airbnb URL" };
  } finally {
    // if (browser) {
    //   await browser.close();
    // }
  }
}

// async function loadDependencies(isAWSLambda: boolean) {
//   if (isAWSLambda) {
//     const chrome = await import("chrome-aws-lambda");
//     const puppeteer = await import("puppeteer-core");
//     return { chrome, puppeteer };
//   } else {
//     const puppeteer = await import("puppeteer");
//     return { chrome: null, puppeteer };
//   }
// }
