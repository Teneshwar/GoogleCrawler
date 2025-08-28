// crawler.js
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const cheerio = require("cheerio");
const { createObjectCsvWriter } = require("csv-writer");
require("dotenv").config();

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID;

const OUTPUT_DIR = path.join(__dirname, "data");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "leads.csv");

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/g;

if (!GOOGLE_API_KEY || !GOOGLE_CSE_ID) {
  console.error("❌ Missing GOOGLE_API_KEY or GOOGLE_CSE_ID in .env");
  process.exit(1);
}
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

async function googleSearchApi(query, numResults = 5) {
  const url = "https://www.googleapis.com/customsearch/v1";
  try {
    const { data } = await axios.get(url, {
      params: { key: GOOGLE_API_KEY, cx: GOOGLE_CSE_ID, q: query, num: numResults },
      timeout: 10000,
    });
    return (data.items || []).map((it) => it.link).filter(Boolean);
  } catch (e) {
    console.log("❌ Google API error:", e.response?.data || e.message);
    return [];
  }
}

async function fetchHtml(url) {
  try {
    const { data } = await axios.get(url, {
      timeout: 12000,
      headers: { "User-Agent": "Mozilla/5.0 (Node Email Crawler)" },
      maxRedirects: 5,
    });
    return data;
  } catch {
    return null;
  }
}

function extractEmails(html) {
  const emails = new Set();

  // 1) regex on full html text
  const matches = html.match(EMAIL_REGEX);
  if (matches) matches.forEach((m) => emails.add(m));

  // 2) pick mailto: links as well
  const $ = cheerio.load(html);
  $('a[href^="mailto:"]').each((_, a) => {
    const raw = ($(a).attr("href") || "").replace(/^mailto:/i, "").split("?")[0];
    if (raw && EMAIL_REGEX.test(raw)) emails.add(raw);
  });

  // basic cleanup (common placeholders)
  return [...emails].filter(
    (e) =>
      !/example\.com$/i.test(e) &&
      !/^noreply@/i.test(e) &&
      !/^no-reply@/i.test(e) &&
      !/^donotreply@/i.test(e)
  );
}

async function saveToCsv(records) {
  const csvWriter = createObjectCsvWriter({
    path: OUTPUT_FILE,
    header: [
      { id: "query", title: "Query" },
      { id: "website", title: "Website" },
      { id: "email", title: "Email" },
    ],
    append: fs.existsSync(OUTPUT_FILE),
  });
  if (records.length) {
    await csvWriter.writeRecords(records);
    console.log(`✅ Saved ${records.length} rows → ${OUTPUT_FILE}`);
  }
}

(async function main() {
  const queriesPath = path.join(__dirname, "queries.txt");
  if (!fs.existsSync(queriesPath)) {
    console.error("❌ queries.txt not found");
    process.exit(1);
  }
  const queries = fs.readFileSync(queriesPath, "utf8").split("\n").map((q) => q.trim()).filter(Boolean);
  console.log("📂 Queries:", queries);

  const allRecords = [];

  for (const query of queries) {
    console.log(`\n🔍 Searching: ${query}`);
    const urls = await googleSearchApi(query, 5);
    if (!urls.length) {
      console.log("   ⚠️ No URLs from API");
      continue;
    }
    for (const url of urls) {
      console.log(`   🌐 ${url}`);
      const html = await fetchHtml(url);
      if (!html) {
        console.log("      ❌ Failed to fetch");
        continue;
      }
      const emails = extractEmails(html);
      if (!emails.length) {
        console.log("      ❌ No emails on page");
        continue;
      }
      emails.forEach((email) => {
        console.log(`      ✉️ ${email}`);
        allRecords.push({ query, website: url, email });
      });
      // polite delay
      await new Promise((r) => setTimeout(r, 800));
    }
    // write per-query chunk (safer if run stops midway)
    await saveToCsv(allRecords.splice(0, allRecords.length));
  }

  console.log("\n🏁 Done.");
})();
