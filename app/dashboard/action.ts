"use server";
import puppeteer from "puppeteer";

export async function scrap(_: any, formData: FormData) {
  const airbnbUrl = formData.get("airbnbUrl") as string;

  let browser;
  try {
    browser = await puppeteer.launch();
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
