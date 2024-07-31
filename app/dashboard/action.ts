"use server";
import puppeteer from "puppeteer";

import { Product } from "@lemonsqueezy/lemonsqueezy.js";
import { db } from "@/db";
import { urlTable, userTable } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

type prodScrapType =
  | {
      res: string;
      error?: undefined;
    }
  | {
      error: string;
      res?: undefined;
    };

export async function getProduct() {
  const endpoint = "https://api.lemonsqueezy.com/v1/products";
  const apiKey =
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI5NGQ1OWNlZi1kYmI4LTRlYTUtYjE3OC1kMjU0MGZjZDY5MTkiLCJqdGkiOiI5OGFiYmY4MGE1ZDViZGQ0MGU1NzQ3MWQwYjQ0NGVhNGFkMzBiYmU3ZGE0NTVlODBiNGI3MDRjZDdjZjc3ZDg1ZjVlN2EwZThlM2JhOGIxMiIsImlhdCI6MTcyMTUwOTEzNC42NDk4MjgsIm5iZiI6MTcyMTUwOTEzNC42NDk4MzEsImV4cCI6MjAzNzA0MTkzNC42MjQ0NTYsInN1YiI6IjIyNTIyMjkiLCJzY29wZXMiOltdfQ.k3zroUakmWfR21Rv7gXlR3-pvR7ldt8buYH67WYYC2ZPgUTbJptQ1b0FzLM9l0GJyDGPbzb6TJ6FdgL0AZg7oF-6jGN7RN3OQfmuz4Yw_otDISbSj_pEgBr-2qyB0Pcve3JvgC0RvTt2UMN2-4ZOnp_a0IUFOOwB7PQ_4xO715fhqTJ0utoxw3Y6so7MqY0-3eo8mWUGdpQNQK2woUHd9mwdvV99zUl3v2UEJ66VE_xSDXpDWQw6WLXW3MPZybGk1w6lKtH5jyNKo44pXMe37SOMHtIczPXxdlDysoVd26jbvcXWapZAtLLaw57zvJsAIWboR40WU8-jikPgot-rjvH94JPZQgFGb38fqPt3jdL60hK4HjUtUUGUdUYrlbjJfx-x9czKSV0JhgEg4Hjuby4nZJ7TPEzczCneLuOOPVIohwxYFMsiVI962vh9TFq5uSiZtHlvvxqP5Ru4USIrqixH3PMYApvrvLP4-jPH5Hdu1jaskmhICo9h0g2LeMwI";
  const headers = {
    Accept: "application/vnd.api+json",
    "Content-Type": "application/vnd.api+json",
    Authorization: `Bearer ${apiKey}`,
  };

  const res = await fetch(endpoint, { headers });

  const resJson = await res.json();
  const product = { ...resJson, data: resJson.data[0] } as Product;

  return { product };
}

export async function getUrls(userId: string) {
  const urls = await db.query.urlTable.findMany({
    where: eq(urlTable.userId, userId),
  });
  return urls.map(({ url, listingUrls }) => ({
    url,
    listingUrls: listingUrls || "",
  }));
}

export async function addUrl(_: any, formData: FormData) {
  try {
    const url = formData.get("airbnbUrl") as string;
    const userId = formData.get("userId") as string;
    const scrapResult =
      process.env.NODE_ENV == "development"
        ? await scrap(url)
        : ((await (
            await fetch("https://bnbnotifier.com/api/test")
          ).json()) as prodScrapType);
    if (scrapResult.error !== undefined) {
      return { isOk: false, msg: "failed to scrap url: " + url };
    } else {
      const lastScraped = new Date();
      const listingUrls = scrapResult.res;
      await db
        .insert(urlTable)
        .values({ userId, url, listingUrls, lastScraped });
      revalidatePath("/dashboard", "page");
      return { isOk: true, msg: "Successfully added url" };
    }
  } catch (error) {
    const errorMessage = (error as Error).message;
    console.log(error);
    return { isOk: false, msg: errorMessage };
  }

  // let browser;
  // try {
  //   browser = await puppeteer.launch();
  //   const page = await browser.newPage();
  //   page.setDefaultNavigationTimeout(0);

  //   await page.goto(airbnbUrl, { waitUntil: "networkidle2" });

  //   const roomLinks = await page.evaluate(() => {
  //     const anchorTags = document.querySelectorAll("a");
  //     const hrefs = Array.from(anchorTags)
  //       .map((anchor) => anchor.href)
  //       .filter((href) => href.includes("/rooms/"));
  //     return Array.from(new Set(hrefs)); // Remove duplicate links
  //   });

  //   return { res: roomLinks };
  // } catch (error) {
  //   console.error("Error scraping Airbnb URL:", error);
  //   return { error: "Failed to scrape the Airbnb URL" };
  // } finally {
  //   if (browser) {
  //     await browser.close();
  //   }
  // }
}

async function scrap(airbnbUrl: string) {
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

    return { res: roomLinks.join(",") };
  } catch (error) {
    console.error("Error scraping Airbnb URL:", error);
    return { error: "Failed to scrape the Airbnb URL" };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
