"use server";
import puppeteer from "puppeteer";

const chrome = require("chrome-aws-lambda");

export async function scrap(_: any, formData: FormData) {
  let options = {};

  if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
    options = {
      args: [...chrome.args, "--hide-scrollbars", "--disable-web-security"],
      defaultViewport: chrome.defaultViewport,
      executablePath: await chrome.executablePath,
      headless: true,
      ignoreHTTPSErrors: true,
    };
  } else {
    options = { headless: true };
  }

  const airbnbUrl = formData.get("airbnbUrl") as string;

  let browser;
  try {
    browser = await puppeteer.launch(options);
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(0);

    await page.goto(airbnbUrl, { waitUntil: "networkidle2" });

    const roomLinks = await page.evaluate(() => {
      const anchorTags = document.querySelectorAll("a");
      const hrefs = Array.from(anchorTags)
        .map((anchor) => anchor.href)
        .filter((href) => href.includes("/rooms/"));
      return Array.from(new Set(hrefs)); // Remove duplicate links
    });

    return { res: roomLinks };
  } catch (error) {
    console.error("Error scraping Airbnb URL:", error);
    return { error: "Failed to scrape the Airbnb URL" };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
