📊 Google Crawler

A simple JavaScript tool that helps businesses find leads and send emails automatically.

It searches Google, collects email addresses from websites, and sends personalized emails using Gmail.

✅ Key Features

🔍 Automated Google Search

Just add search terms like dentist in Delhi email and it finds relevant websites.

✉️ Email Scraping

Gathers real email addresses from websites and ignores fake ones.

💾 CSV Storage

Saves leads in leads.csv and keeps track of sent emails in sent_emails.csv.

📤 Automatic Email Sending

Uses Gmail (via Nodemailer) to send personalized emails to leads.

🧪 Dry-Run Mode

Test without actually sending emails, to make sure everything works safely.

⏱️ Throttle Control

Controls sending speed to avoid spam filters.

⚡ Tech Stack

✅ Language: JavaScript (Node.js)

✅ Packages: Axios, Cheerio, csv-parser, csv-writer, Nodemailer, dotenv

✅ Email Service: Gmail SMTP

🚀 How It Works

Add your search queries in queries.txt.

The crawler searches Google and visits websites.

It collects and filters valid emails.

Saves them in leads.csv.

Sends emails using the list.

Logs all actions in CSV files for easy tracking.

⚙️ Installation

Clone the project

git clone <repository-url>


Go to the project folder

cd GoogleCrawlerInJs


Install dependencies

npm install


Create a .env file with these details:

GMAIL_USER=your_email@gmail.com

GMAIL_APP_PASSWORD=your_app_password

DRY_RUN=true

▶️ Usage

Add your search queries in queries.txt (one query per line).

Run the crawler:

npm run crawl


Check leads.csv for collected emails and sent_emails.csv for sent emails.

##Send emails:

npm run send


Check data/sent_emails.csv for logs.
