// email_sender.js
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const nodemailer = require("nodemailer");
require("dotenv").config();

const LEADS_FILE = path.join(__dirname, "data", "leads.csv");
const SENT_FILE = path.join(__dirname, "data", "sent_emails.csv");

const DRY_RUN = (process.env.DRY_RUN || "true").toLowerCase() === "true";
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
  console.error("❌ Missing GMAIL_USER or GMAIL_APP_PASSWORD in .env");
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
});

// Throttle delay
function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// Send email wrapper
async function sendEmail(to, subject, text) {
  if (DRY_RUN) {
    console.log(`[DRY-RUN] ✅ Would send to: ${to}`);
    return true; // pretend success
  }
  try {
    await transporter.sendMail({ from: `"Outreach" <${GMAIL_USER}>`, to, subject, text });
    console.log(`✅ Sent: ${to}`);
    return true;
  } catch (e) {
    console.log(`❌ Failed (${to}):`, e.message);
    return false;
  }
}

(async function main() {
  if (!fs.existsSync(LEADS_FILE)) {
    console.error("❌ leads.csv not found");
    process.exit(1);
  }

  // CSV writer for sent emails
  const csvWriter = createCsvWriter({
    path: SENT_FILE,
    header: [
      { id: "email", title: "Email" },
      { id: "status", title: "Status" },
      { id: "query", title: "Query" },
    ],
    append: true,
  });

  const uniqueEmails = new Map(); // email → query

  const subject = "Quick intro from our team Hackveda";
  const body = `Hi,

We help businesses improve their web presence & growth. 
If you're the right contact, I'd love to share a short overview.

Thanks,
Teneshwar (Hackveda Intern)
`;

  // Read CSV and collect emails
  await new Promise((resolve) => {
    fs.createReadStream(LEADS_FILE)
      .pipe(csv(["query", "website", "email"]))
      .on("data", (row) => {
        const email = (row.email || "").trim();
        const query = row.query || "N/A";
        if (email && email.includes("@") && !email.includes("user@domain.com") && !email.endsWith("@example.com")) {
          uniqueEmails.set(email, query);
        }
      })
      .on("end", resolve);
  });

  console.log(`📧 Unique valid recipients: ${uniqueEmails.size}`);
  if (uniqueEmails.size === 0) {
    console.log("⚠️ No valid emails found. Exiting...");
    return;
  }

  // Send emails with throttling
  for (const [email, query] of uniqueEmails.entries()) {
    const success = await sendEmail(email, subject, body);
    await csvWriter.writeRecords([{ email, status: success ? "Sent" : "Failed", query }]);
    await delay(1000); // 1 sec delay
  }

  console.log(`🏁 Email job complete. Sent log saved → ${SENT_FILE}`);
})();
