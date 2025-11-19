# LeadMailer Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set up Environment Variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   - `DATABASE_URL`: Your MongoDB connection string (e.g., `mongodb://localhost:27017/leadmailer` or MongoDB Atlas connection string)
   - SMTP settings for email sending

3. **Set up Database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Access the Application**
   - Open [http://localhost:3000](http://localhost:3000)
   - No login required - dashboard is directly accessible

## Database Setup

### Using MongoDB

1. **Local MongoDB**
   ```bash
   # Install MongoDB (if not installed)
   # Start MongoDB service
   # Connection string: mongodb://localhost:27017/leadmailer
   ```

2. **Using MongoDB Atlas (Free)**
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster
   - Get connection string from "Connect" button
   - Use it as `DATABASE_URL` in `.env`

3. **Connection String Format**
   ```
   DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/leadmailer?retryWrites=true&w=majority"
   ```

## SMTP Configuration

### Gmail Setup

1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to Google Account settings
   - Security > 2-Step Verification > App passwords
   - Generate password for "Mail"
3. Use in `.env`:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   SMTP_FROM_EMAIL=your-email@gmail.com
   SMTP_FROM_NAME=LeadMailer
   ```

### Other SMTP Providers

- **SendGrid**: Use SMTP relay settings
- **Mailgun**: Use SMTP settings from dashboard
- **AWS SES**: Use SMTP credentials from AWS console

## Automated Email Cron Jobs

### Option 1: Vercel Cron (if deploying to Vercel)

The `vercel.json` file is already configured with both cron jobs:
- **Follow-up emails**: Runs every hour
- **Daily campaigns**: Runs once per day at 9:00 AM

The cron jobs will automatically:
- Send follow-up emails that are due
- Send daily campaign emails (700 per day) for all active campaigns
- Respect daily limits and avoid duplicate sends

### Option 2: External Cron Service

Use a service like:
- [cron-job.org](https://cron-job.org)
- [EasyCron](https://www.easycron.com)

**For Follow-up Emails** (every hour):
- URL: `https://your-domain.com/api/cron/followup`
- Schedule: `0 * * * *` (every hour at minute 0)
- Header: `Authorization: Bearer YOUR_CRON_SECRET`

**For Daily Campaigns** (once per day):
- URL: `https://your-domain.com/api/cron/daily-campaigns`
- Schedule: `0 9 * * *` (every day at 9:00 AM)
- Header: `Authorization: Bearer YOUR_CRON_SECRET`

### Option 3: Server Cron (if self-hosting)

Add to crontab:
```bash
# Follow-up emails - every hour
0 * * * * curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://your-domain.com/api/cron/followup

# Daily campaigns - every day at 9:00 AM
0 9 * * * curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://your-domain.com/api/cron/daily-campaigns
```

### How Daily Campaigns Work

1. **Active Campaigns**: Only campaigns with status `'active'` are sent automatically
2. **Daily Limit**: Maximum 700 campaign emails per day (follow-ups don't count)
3. **No Duplicates**: Each campaign only sends to leads that haven't received that campaign's email
4. **Automatic**: Runs every day at 9:00 AM automatically
5. **Status Management**: Campaigns stay `'active'` to allow daily sending

## CSV Upload Format

Your CSV file should have these columns:

```csv
BusinessName,Email,Telephone,WebsiteURL,Linkedin,Address,Category,City,State
"ABC Company","contact@abc.com","1234567890","https://abc.com","","123 Main St","Retail","New York","NY"
```

**Required**: `BusinessName`, `Email`
**Optional**: All other columns

## Troubleshooting

### Database Connection Issues
- Check `DATABASE_URL` format
- Ensure MongoDB is running
- Check firewall/network settings
- For Atlas, whitelist your IP address

### Email Sending Fails
- Verify SMTP credentials
- Check SMTP port (587 for TLS, 465 for SSL)
- For Gmail, ensure App Password is used (not regular password)
- Check spam folder

### Build Errors
- Run `npx prisma generate` after schema changes
- Delete `.next` folder and rebuild
- Check Node.js version (18+ required)

## Production Deployment

### Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables for Production

- Set `NODE_ENV=production`
- Use production MongoDB database
- Configure production SMTP
- Set `CRON_SECRET` for follow-up cron job

## Notes

- **No Authentication**: Login functionality has been disabled. The dashboard is directly accessible.
- **MongoDB**: The application now uses MongoDB instead of PostgreSQL.
- **SMTP Settings**: Can be configured via the dashboard or environment variables.
