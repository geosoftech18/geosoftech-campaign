# Testing Campaign Sending Locally

## Step 1: Test with Small Campaign (10-20 emails)

1. **Start your local server:**
   ```bash
   npm run dev
   ```

2. **Create a test campaign:**
   - Go to http://localhost:3000/dashboard/campaigns/new
   - Create a campaign with 10-20 test leads
   - Make sure SMTP settings are configured correctly

3. **Send the test campaign:**
   - Go to the campaign page
   - Click "Send Campaign"
   - Watch the console logs for progress:
     ```
     🚀 Starting campaign send: 10 emails to send
     📊 Batch size: 20, Email delay: 3000ms, Batch delay: 10000ms
     
     📦 Processing Batch 1/1 (10 emails)...
     ✅ [1/10] (10.0%) Sent to email1@example.com | Total: 1 sent, 0 failed | Rate: 20.0/min
     ...
     ```

4. **Check results:**
   - Verify emails were sent successfully
   - Check for any errors in console
   - Verify analytics page shows the sent emails

## Step 2: If Test Successful, Push to Production

1. **Commit changes:**
   ```bash
   git add .
   git commit -m "Add email sending improvements: rate limiting, progress tracking, retry logic"
   ```

2. **Push to production:**
   ```bash
   git push origin main
   ```

3. **Wait for Vercel deployment** (automatic)

4. **Test on production:**
   - Send a small test campaign first (10-20 emails)
   - Monitor the logs in Vercel dashboard
   - If successful, send the full 700 email campaign

## Important Notes

- **Always test locally first** with a small batch
- **Monitor console logs** for any errors
- **Check Gmail App Password** is still valid
- **Start with small campaigns** before sending 700 emails
- **Watch for rate limit errors** in the logs

## Expected Behavior

- ✅ Emails send one at a time with 3-second delays
- ✅ Progress is shown in real-time
- ✅ Retries happen automatically for transient failures
- ✅ Final summary shows success rate
- ✅ No rate limit errors should occur

