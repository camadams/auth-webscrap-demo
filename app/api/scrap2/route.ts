// import type { NextApiRequest, NextApiResponse } from "next";
// import puppeteer, { ConsoleMessage } from "puppeteer";
// import cheerio from "cheerio";
// import { NextResponse } from "next/server";

// type Data = {
//   spans: string[];
// };

// export async function GET(req: NextApiRequest, res: NextApiResponse) {
//   try {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();
//     await page.goto("https://quotes.toscrape.com/", {
//       waitUntil: "networkidle2",
//     });

//     // Extract quotes from the page
//     // const quotes = await page.evaluate(() => {
//     //   const quoteElements = document.querySelectorAll(".quote");
//     //   return Array.from(quoteElements).map((quote) => {
//     //     const textElement = quote.querySelector(".text");
//     //     const authorElement = quote.querySelector(".author");

//     //     const text = textElement ? textElement.innerText : "";
//     //     const author = authorElement ? authorElement.innerText : "";

//     //     return { text, author };
//     //   });
//     // });

//     const hrefs = await page.evaluate(() => {
//       let links = [];
//       let elements2 = document.querySelectorAll("a");
//       for (let element2 of elements2) links.push(element2.href);
//       return links;
//     });

//     await browser.close();

//     return NextResponse.json(hrefs, { status: 200 });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json({ error: "Error scraping data" }, { status: 500 });
//   }
// }
