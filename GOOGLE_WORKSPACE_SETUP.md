# Google Workspace / Gmail Integration Setup Guide

## Overview
Your application now supports three email provider options:
1. **Generic SMTP** - Any SMTP server
2. **Gmail SMTP** - Google Workspace/Gmail using App Password (Easy)
3. **Gmail API** - Google Workspace/Gmail using OAuth2 (Recommended)

## Option 1: Gmail SMTP with App Password (Easiest)

### Steps:
1. **Enable 2-Step Verification**
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable 2-Step Verification if not already enabled

2. **Generate App Password**
   - Go to [App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and your device
   - Click "Generate"
   - Copy the 16-character password (spaces don't matter)

3. **Configure in Application**
   - Go to Settings → Email Settings
   - Select "Google Workspace / Gmail (SMTP with App Password)"
   - Enter your Gmail/Google Workspace email
   - Paste the 16-character App Password
   - Enter From Email and From Name
   - Save

### Advantages:
- ✅ Quick setup (5 minutes)
- ✅ No OAuth2 configuration needed
- ✅ Works immediately

### Limitations:
- ⚠️ Lower rate limits (500 emails/day for free Gmail, 2000/day for Google Workspace)
- ⚠️ Less secure than OAuth2

---

## Option 2: Gmail API with OAuth2 (Recommended)

### Steps:

#### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click "Create Project"
3. Enter project name (e.g., "Email Campaign Manager")
4. Click "Create"

#### 2. Enable Gmail API
1. In your project, go to "APIs & Services" → "Library"
2. Search for "Gmail API"
3. Click "Enable"

#### 3. Create OAuth2 Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. If prompted, configure OAuth consent screen:
   - User Type: External (or Internal for Google Workspace)
   - App name: Your app name
   - User support email: Your email
   - Developer contact: Your email
   - Click "Save and Continue"
   - Scopes: Add `https://www.googleapis.com/auth/gmail.send`
   - Click "Save and Continue"
   - Test users: Add your email (for testing)
   - Click "Save and Continue"
4. Create OAuth Client:
   - Application type: "Web application"
   - Name: "Email Campaign Manager"
   - Authorized redirect URIs: `https://developers.google.com/oauthplayground`
   - Click "Create"
5. **Copy Client ID and Client Secret** (you'll need these)

#### 4. Get Refresh Token
1. Go to [OAuth 2.0 Playground](https://developers.google.com/oauthplayground)
2. Click the gear icon (⚙️) in top right
3. Check "Use your own OAuth credentials"
4. Enter your Client ID and Client Secret
5. In the left panel, find "Gmail API v1"
6. Select `https://www.googleapis.com/auth/gmail.send`
7. Click "Authorize APIs"
8. Sign in with your Google account
9. Click "Allow"
10. Click "Exchange authorization code for tokens"
11. **Copy the Refresh Token** (starts with `1//`)

#### 5. Configure in Application
1. Go to Settings → Email Settings
2. Select "Google Workspace / Gmail (API with OAuth2) - Recommended"
3. Enter your Gmail/Google Workspace email
4. Paste Client ID
5. Paste Client Secret
6. Paste Refresh Token
7. Enter From Email and From Name
8. Save

### Advantages:
- ✅ Higher rate limits (up to 10,000 emails/day for Google Workspace)
- ✅ More secure (OAuth2)
- ✅ Better deliverability
- ✅ Automatic token refresh

### Limitations:
- ⚠️ More complex setup (15-20 minutes)
- ⚠️ Requires Google Cloud Console access

---

## Rate Limits

| Provider | Free Gmail | Google Workspace |
|----------|-----------|------------------|
| **Gmail SMTP** | 500/day | 2,000/day |
| **Gmail API** | 500/day | 10,000/day |

## Troubleshooting

### "Authentication failed" error
- **Gmail SMTP**: Verify App Password is correct (16 characters, no spaces)
- **Gmail API**: Verify Client ID, Secret, and Refresh Token are correct

### "Rate limit exceeded" error
- You've hit daily sending limits
- Wait 24 hours or upgrade to Google Workspace

### "Invalid refresh token" error
- Token may have expired
- Regenerate refresh token using OAuth Playground

## Security Notes

- **Never commit** OAuth credentials or App Passwords to git
- Store them securely in your database (already encrypted)
- Rotate credentials periodically
- Use Google Workspace for production (better limits and security)

## Support

For issues:
1. Check Google Cloud Console for API errors
2. Verify OAuth consent screen is configured
3. Ensure Gmail API is enabled
4. Check rate limits haven't been exceeded

