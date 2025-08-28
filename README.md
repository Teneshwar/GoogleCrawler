###Google Crawler 

This project is a JavaScript-based automation tool that streamlines lead generation and email outreach for businesses. It automatically searches Google using custom queries, scrapes websites for email addresses, and sends personalized outreach emails using Gmail SMTP.

##Key Features

Automated Google search queries: Enter queries like “dentist in Delhi email” to fetch relevant websites.

Email scraping: Extracts emails from websites using Cheerio and filters out invalid or placeholder addresses.

CSV storage: Saves collected leads in leads.csv and logs sent emails in sent_emails.csv for easy tracking.

Automated emailing: Sends emails using Nodemailer with Gmail credentials, supporting personalized templates.

Dry-run mode: Simulate sending emails without actually delivering them for safe testing.

Throttle control: Sends emails at controlled intervals to reduce spam risk.

##Tech Stack

Language: JavaScript (Node.js)

Packages: Axios, Cheerio, csv-parser, csv-writer, Nodemailer, dotenv

Email Service: Gmail SMTP

##How it Works

Load search queries from queries.txt.

The crawler fetches search results and scans websites for emails.

Emails are validated, deduplicated, and saved in a CSV file.

The email sender reads this CSV and dispatches personalized messages to each valid email.

All activity is logged, ensuring transparency and repeatability.

##Installation

Clone the repository:

git clone <repository-url>


##Navigate to the project directory:

cd GoogleCrawlerInJs


##Install dependencies:

npm install


##Create a .env file:

GMAIL_USER=your_email@gmail.com

GMAIL_APP_PASSWORD=your_app_password

DRY_RUN=true

##Usage

Add your search queries in queries.txt.

Run the crawler to collect emails:

npm run crawl


##Send emails:

npm run send


Check data/sent_emails.csv for logs.
