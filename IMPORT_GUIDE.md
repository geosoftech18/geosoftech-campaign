# Import Leads Guide

You have two options to import your 27,000 company leads:

## Option 1: Bulk Import Script (Recommended for Large Files)

This script processes your data in batches and handles large files efficiently.

### Steps:

1. **Import from CSV file:**
   ```bash
   npm run import:leads filtered_leads_city_state.csv
   ```

2. **Or import from JSON file:**
   ```bash
   npm run import:leads csvjson.json
   ```

### What the script does:
- ✅ Validates email addresses
- ✅ Removes duplicates automatically
- ✅ Processes data in batches of 100 (to avoid memory issues)
- ✅ Shows progress updates
- ✅ Provides detailed summary at the end

### Example Output:
```
============================================================
LeadMailer - Bulk Import Script
============================================================
Reading CSV file: filtered_leads_city_state.csv

Parsed 27000 valid leads
⚠️  5 parsing errors

Importing 27000 leads in batches of 100...
Processing batch 1/270 (100 leads)...
Processing batch 2/270 (100 leads)...
...
Progress: 1000/27000 processed
...

============================================================
Import Summary
============================================================
✅ Successfully imported: 26995
⚠️  Duplicates skipped: 0
❌ Errors: 0
📊 Total processed: 27000
============================================================
```

## Option 2: Web UI Upload (For Smaller Files)

If you want to use the web interface:

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:3000/dashboard/leads

3. Click "Select CSV File" and choose your CSV file

4. Click "Upload Leads"

**Note:** The web UI is better for smaller files (< 1000 records). For 27,000 records, use the bulk import script.

## File Format Requirements

Your CSV/JSON file should have these columns:

**Required:**
- `BusinessName` - Company name
- `Email` - Valid email address

**Optional:**
- `Telephone` - Phone number
- `WebsiteURL` - Website URL
- `Linkedin` - LinkedIn URL
- `Address` - Physical address
- `Category` - Business category
- `City` - City name
- `State` - State/Province name

## Troubleshooting

### "File not found" error
- Make sure you're running the command from the project root directory
- Use the full path if the file is in a different location:
  ```bash
  npm run import:leads "C:\Users\hp\Desktop\campain\filtered_leads_city_state.csv"
  ```

### Import is slow
- This is normal for 27,000 records. The script processes in batches to avoid memory issues.
- Expect it to take 5-10 minutes depending on your system and database connection.

### Duplicate emails
- The script automatically skips duplicates based on email address
- If a lead with the same email already exists, it will update the existing record

### Memory errors
- The script processes in batches of 100 to avoid memory issues
- If you still get memory errors, you can modify the batch size in `scripts/import-leads.ts`

## After Import

Once your leads are imported:

1. **View your leads:**
   - Go to http://localhost:3000/dashboard/leads
   - You can search and filter by City, State, or Category

2. **Create a campaign:**
   - Go to http://localhost:3000/dashboard/campaigns
   - Click "New Campaign"
   - Use template variables: `{{BusinessName}}`, `{{City}}`, `{{State}}`, `{{Category}}`

3. **Send emails:**
   - After creating a campaign, click "Send Campaign"
   - Emails will be sent in batches of 100 to protect your domain health


