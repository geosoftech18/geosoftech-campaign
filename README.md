# LeadMailer - Email Campaign Dashboard

A professional email marketing platform built with Next.js, TypeScript, Prisma, and MongoDB for managing leads and running email campaigns.

## Features

- 📊 **Lead Management**: Upload CSV files, validate emails, remove duplicates
- 📧 **Campaign Creator**: Create email campaigns with rich text editor and template variables
- 📈 **Email Tracking**: Track opens and clicks with invisible pixels and redirect links
- 🔄 **Follow-up Sequencing**: Automatic follow-up emails after X days
- 📊 **Analytics Dashboard**: View open rates, click rates, and campaign performance
- ⚙️ **SMTP Configuration**: Configure your email server settings
- 🚀 **No Authentication Required**: Direct access to dashboard

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Database**: MongoDB with Prisma ORM
- **Email**: Nodemailer
- **CSV Parsing**: PapaParse
- **Charts**: Recharts
- **UI Components**: Radix UI + shadcn/ui

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB database (local or MongoDB Atlas)
- SMTP email account (Gmail, SendGrid, etc.)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd campain
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your configuration:
   ```env
   DATABASE_URL="mongodb://localhost:27017/leadmailer"
   # Or for MongoDB Atlas:
   # DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/leadmailer?retryWrites=true&w=majority"
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   SMTP_FROM_EMAIL=your-email@gmail.com
   SMTP_FROM_NAME=LeadMailer
   CRON_SECRET=your-cron-secret
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)
   - No login required - dashboard is directly accessible

## Project Structure

```
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # NextAuth routes
│   │   ├── campaigns/    # Campaign CRUD and send
│   │   ├── leads/        # Lead upload and fetch
│   │   ├── track/        # Email tracking (open/click)
│   │   ├── cron/         # Follow-up cron job
│   │   └── settings/     # SMTP settings
│   ├── dashboard/        # Dashboard pages
│   │   ├── leads/        # Leads management
│   │   ├── campaigns/    # Campaigns list and create
│   │   ├── analytics/    # Analytics dashboard
│   │   └── settings/     # Settings pages
│   ├── login/            # Login page
│   └── layout.tsx        # Root layout
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── dashboard/        # Dashboard components
│   ├── CSVUploader.tsx   # CSV upload component
│   ├── LeadTable.tsx    # Leads table with filters
│   ├── CampaignForm.tsx # Campaign creation form
│   ├── Editor.tsx       # Rich text editor
│   ├── StatsCard.tsx    # Statistics card
│   └── Chart.tsx        # Chart component
├── lib/
│   ├── prisma.ts        # Prisma client
│   ├── auth.ts          # NextAuth configuration
│   ├── csvParser.ts     # CSV parsing utilities
│   ├── emailSender.ts   # Email sending logic
│   ├── segmenter.ts    # Lead segmentation
│   └── cron.ts          # Cron job setup
└── prisma/
    └── schema.prisma    # Database schema
```

## Usage

### 1. Upload Leads

1. Go to **Leads** page
2. Click **Select CSV File** and choose your CSV file
3. CSV should have columns: `BusinessName`, `Email`, `Telephone`, `WebsiteURL`, `Linkedin`, `Address`, `Category`, `City`, `State`
4. Click **Upload Leads**
5. Leads will be validated and duplicates removed automatically

### 2. Create Campaign

1. Go to **Campaigns** page
2. Click **New Campaign**
3. Fill in:
   - Campaign Name
   - Email Subject (use variables: `{{BusinessName}}`, `{{City}}`, `{{State}}`, `{{Category}}`)
   - Email Body (HTML supported)
   - Optional: Segment filters (City/State/Category)
   - Optional: Follow-up emails
4. Click **Create Campaign**

### 3. Send Campaign

1. Go to **Campaigns** page
2. Click **Send** on a draft campaign
3. Emails will be sent in batches of 100 to protect domain health
4. Track progress in **Analytics** page

### 4. View Analytics

1. Go to **Analytics** page
2. View:
   - Total emails sent
   - Open rate
   - Click rate
   - Campaign performance charts
   - Failed emails

### 5. Configure SMTP

1. Go to **SMTP Settings**
2. Enter your SMTP configuration
3. For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833)
4. Click **Save Settings**

## Email Tracking

- **Open Tracking**: Invisible 1x1 pixel image embedded in emails
- **Click Tracking**: All links are wrapped with tracking redirects
- Tracking data is stored in the database and visible in Analytics

## Follow-up Emails

- Configure follow-up 1 and follow-up 2 in campaign settings
- Follow-ups are scheduled automatically when main email is sent
- Cron job processes follow-ups every hour
- To set up cron job, add to your server's crontab or use a service like Vercel Cron

## CSV Format

Your CSV file should have the following columns:

```csv
BusinessName,Email,Telephone,WebsiteURL,Linkedin,Address,Category,City,State
"ABC Company","contact@abc.com","1234567890","https://abc.com","","123 Main St","Retail","New York","NY"
```

Required columns: `BusinessName`, `Email`
Optional columns: All others

## Template Variables

Use these variables in your email subject and body:

- `{{BusinessName}}` - Business name
- `{{City}}` - City
- `{{State}}` - State
- `{{Category}}` - Category

Example:
```
Subject: Welcome {{BusinessName}}!
Body: Hello {{BusinessName}}, we're excited to reach out to businesses in {{City}}, {{State}}!
```

## Production Deployment

1. **Set up MongoDB database** (e.g., MongoDB Atlas, Railway, AWS DocumentDB)
2. **Update environment variables** in your hosting platform
3. **Push database schema**:
   ```bash
   npx prisma db push
   npx prisma generate
   ```
4. **Set up cron job** for follow-ups:
   - Use Vercel Cron (if on Vercel)
   - Or set up a server cron job calling `/api/cron/followup`
5. **Build and deploy**:
   ```bash
   npm run build
   npm start
   ```

## Security Notes

- **No Authentication**: Login functionality has been disabled. Consider adding authentication for production use.
- Use secure SMTP connections
- Implement rate limiting for API routes
- Add CSRF protection
- Use environment variables for all secrets
- Consider adding authentication middleware for production deployments

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.

