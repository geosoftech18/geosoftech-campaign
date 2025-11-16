import { EmailTemplateData, themeColors } from './emailTemplate'

// Generate Follow-up 1 Email
export function generateFollowUp1Email(data: EmailTemplateData, preview: boolean = false): string {
  const colors = themeColors[data.theme]
  const firstName = preview ? data.firstName : 'there'
  const companyName = preview ? data.companyName : '{{BusinessName}}'
  const phone = data.phone
  const website = data.website
  const email = data.email
  const address = data.address
  const founderName = data.founderName
  const companyBrand = data.companyBrand
  const instagram = data.instagram
  const facebook = data.facebook

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quick Follow-up - ${companyName}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: #f1f5f9; padding: 40px 20px; line-height: 1.6;
        }
        .email-container {
            max-width: 600px; margin: 0 auto; background: #ffffff;
            border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }
        .header {
            background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%);
            padding: 30px; text-align: center;
        }
        .header-text { color: #ffffff; font-size: 18px; font-weight: 600; }
        .content { padding: 40px 30px; }
        .greeting { font-size: 18px; color: #0f172a; margin-bottom: 20px; }
        .paragraph { font-size: 16px; color: #334155; margin-bottom: 20px; line-height: 1.7; }
        .highlight-box {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border-left: 4px solid ${colors.accent};
            padding: 20px; margin: 28px 0; border-radius: 8px;
        }
        .highlight-title {
            font-size: 16px; font-weight: 700; color: #78350f; margin-bottom: 12px;
        }
        .highlight-item {
            font-size: 15px; color: #78350f; margin: 8px 0; padding-left: 20px; position: relative;
        }
        .highlight-item::before {
            content: '✓'; position: absolute; left: 0; color: ${colors.primary}; font-weight: bold;
        }
        .value-prop {
            display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 24px 0;
        }
        .value-card {
            background: #f8fafc; padding: 16px; border-radius: 8px; text-align: center;
            border: 2px solid #e2e8f0;
        }
        .value-time {
            font-size: 28px; font-weight: 700; color: ${colors.primary}; margin-bottom: 4px;
        }
        .value-label {
            font-size: 13px; color: #64748b; font-weight: 500;
        }
        .cta-section {
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
            padding: 32px; border-radius: 12px; margin: 32px 0; text-align: center; border: 2px solid #e2e8f0;
        }
        .cta-question {
            font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 20px;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%);
            color: #ffffff; padding: 16px 40px; border-radius: 8px;
            text-decoration: none; font-weight: 600; font-size: 16px;
            box-shadow: 0 4px 12px ${colors.primary}66; transition: all 0.3s ease;
        }
        .cta-button:hover {
            transform: translateY(-2px) scale(1.05); box-shadow: 0 6px 20px ${colors.primary}99;
        }
        .cta-contact-box {
            background: #ffffff; border: 2px solid #e2e8f0; border-radius: 12px;
            padding: 20px; margin-top: 20px; text-align: left;
        }
        .cta-contact-item {
            display: flex; align-items: center; margin: 10px 0;
            color: #475569; font-size: 14px;
        }
        .cta-contact-icon { margin-right: 10px; font-size: 16px; }
        .footer { background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0; }
        .logo-container {
            margin-bottom: 20px;
            text-align: center;
        }
        .logo-image {
            max-width: 150px;
            height: auto;
            display: inline-block;
        }
        .signature { margin-bottom: 20px; }
        .signature-name { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
        .signature-title { font-size: 14px; color: #64748b; }
        .contact-info {
            display: flex; justify-content: center; align-items: center;
            flex-wrap: wrap; gap: 16px; margin-top: 16px;
        }
        .contact-item {
            display: flex; align-items: center; color: #475569;
            font-size: 14px; text-decoration: none;
        }
        .contact-item:hover { color: ${colors.primary}; }
        .contact-icon { margin-right: 6px; }
        .social-links { display: flex; justify-content: center; gap: 16px; margin-top: 16px; }
        .social-link {
            display: inline-flex; align-items: center; justify-content: center;
            width: 40px; height: 40px; border-radius: 50%;
            background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%);
            color: #ffffff; text-decoration: none; font-size: 20px;
            transition: all 0.3s ease; box-shadow: 0 2px 8px ${colors.primary}33;
        }
        .social-link img {
            width: 20px !important;
            height: 20px !important;
            display: block !important;
            border: none;
            outline: none;
        }
        .social-link:hover {
            transform: translateY(-3px) scale(1.1); box-shadow: 0 4px 12px ${colors.primary}66;
        }
        @media only screen and (max-width: 600px) {
            body { padding: 20px 10px; }
            .content { padding: 30px 20px; }
            .value-prop { grid-template-columns: 1fr; }
            .cta-section { padding: 24px 20px; }
            .cta-contact-box { padding: 16px; }
            .contact-info { flex-direction: column; gap: 12px; }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="header-text">Quick Follow-up</div>
        </div>
        <div class="content">
            <div class="greeting">Hi ${firstName},</div>
            <p class="paragraph">
                I sent over an offer to create a free custom homepage prototype for <strong>${companyName}</strong> a few days ago.
            </p>
            <p class="paragraph">
                Not sure if it got buried in your inbox (happens to the best of us), so I wanted to ping you once more.
            </p>
            <div class="highlight-box">
                <div class="highlight-title">The offer still stands:</div>
                <div class="highlight-item">A personalized homepage design + conversion audit</div>
                <div class="highlight-item">Completely on us</div>
                <div class="highlight-item">No strings attached</div>
            </div>
            <div class="value-prop">
                <div class="value-card">
                    <div class="value-time">~3 hours</div>
                    <div class="value-label">For me to build</div>
                </div>
                <div class="value-card">
                    <div class="value-time">5 minutes</div>
                    <div class="value-label">For you to review</div>
                </div>
            </div>
            <div class="cta-section">
                <div class="cta-question">Want me to go ahead with it?</div>
                <a href="mailto:${email}?subject=Yes - Let's do it for ${companyName}" class="cta-button">
                    Yes, Let's Do It
                </a>
                <div class="cta-contact-box">
                    <div class="cta-contact-item">
                        <span class="cta-contact-icon">📞</span>
                        <a href="tel:${phone}" style="color: #475569; text-decoration: none;">${phone}</a>
                    </div>
                    <div class="cta-contact-item">
                        <span class="cta-contact-icon">✉️</span>
                        <a href="mailto:${email}" style="color: #475569; text-decoration: none;">${email}</a>
                    </div>
                    <div class="cta-contact-item">
                        <span class="cta-contact-icon">📍</span>
                        <span>${address}</span>
                    </div>
                </div>
            </div>
            <p class="paragraph" style="text-align: center; color: #64748b; font-size: 14px; margin-top: 32px;">
                Best regards,<br>
                <strong style="color: #0f172a;">${founderName}</strong>
            </p>
        </div>
        <div class="footer">
            <a href="https://www.geosoftech.com" class="logo-container">
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqNdXdvT7wD9JHTJEC6URa1jEDH7xuDoVjtQ&s" alt="${companyBrand} Logo" class="logo-image" />
            </a>
            <div class="signature">
                <div class="signature-name">${founderName}</div>
                <div class="signature-title">Founder, ${companyBrand}</div>
            </div>
            <div class="contact-info">
               
             
                <a href="https://${website}" class="contact-item">
                    <span class="contact-icon">🌐</span>
                    ${website}
                </a>
            </div>
            <div class="social-links">
                <a href="https://instagram.com/${instagram.replace('@', '')}" class="social-link" title="Follow us on Instagram" target="_blank">
                    <img src="https://cdn.simpleicons.org/instagram/FFFFFF" alt="Instagram" width="20" height="20" style="display: block; width: 20px; height: 20px;" />
                </a>
                <a href="https://facebook.com/${facebook}" class="social-link" title="Like us on Facebook" target="_blank">👍</a>
            </div>
        </div>
    </div>
</body>
</html>
  `.trim()
}

// Generate Follow-up 2 Email (Example-based)
export function generateFollowUp2Email(data: EmailTemplateData, preview: boolean = false): string {
  const colors = themeColors[data.theme]
  const firstName = preview ? data.firstName : 'there'
  const companyName = preview ? data.companyName : '{{BusinessName}}'
  const phone = data.phone
  const website = data.website
  const email = data.email
  const address = data.address
  const founderName = data.founderName
  const companyBrand = data.companyBrand
  const instagram = data.instagram
  const facebook = data.facebook
  const linkedin = data.linkedin

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${companyName} Example - See What I Mean</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: #f1f5f9; padding: 40px 20px; line-height: 1.6;
        }
        .email-container {
            max-width: 600px; margin: 0 auto; background: #ffffff;
            border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }
        .header {
            background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%);
            padding: 30px; text-align: center;
        }
        .header-text { color: #ffffff; font-size: 20px; font-weight: 700; margin-bottom: 4px; }
        .header-subtext { color: rgba(255, 255, 255, 0.9); font-size: 14px; }
        .content { padding: 40px 30px; }
        .greeting { font-size: 18px; color: #0f172a; margin-bottom: 20px; }
        .paragraph { font-size: 16px; color: #334155; margin-bottom: 20px; line-height: 1.7; }
        .comparison-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 24px 0; }
        .comparison-card {
            background: #f8fafc; border-radius: 12px; padding: 20px;
            border: 2px solid #e2e8f0; position: relative; overflow: hidden;
        }
        .comparison-card::before {
            content: ''; position: absolute; top: 0; left: 0; right: 0;
            height: 4px; background: ${colors.primary};
        }
        .comparison-card.before::before { background: #ef4444; }
        .comparison-card.after::before { background: #10b981; }
        .comparison-label {
            font-size: 12px; font-weight: 700; text-transform: uppercase;
            letter-spacing: 0.5px; margin-bottom: 12px; display: inline-block;
            padding: 4px 12px; border-radius: 6px;
        }
        .comparison-card.before .comparison-label { background: #fee2e2; color: #991b1b; }
        .comparison-card.after .comparison-label { background: #d1fae5; color: #065f46; }
        .comparison-item {
            font-size: 14px; color: #475569; margin: 8px 0;
            padding-left: 20px; position: relative; line-height: 1.5;
        }
        .comparison-card.before .comparison-item::before {
            content: '✗'; position: absolute; left: 0; color: #ef4444; font-weight: bold;
        }
        .comparison-card.after .comparison-item::before {
            content: '✓'; position: absolute; left: 0; color: #10b981; font-weight: bold;
        }
        .result-banner {
            background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
            border: 2px solid #10b981; border-radius: 12px;
            padding: 20px; margin: 24px 0; text-align: center;
        }
        .result-text {
            font-size: 18px; font-weight: 700; color: #065f46; margin-bottom: 8px;
        }
        .result-multiplier {
            font-size: 32px; font-weight: 900; color: #10b981;
            text-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
        }
        .cta-section {
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
            padding: 32px; border-radius: 12px; margin: 32px 0;
            text-align: center; border: 2px solid #e2e8f0;
        }
        .cta-question { font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 20px; }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%);
            color: #ffffff; padding: 16px 40px; border-radius: 8px;
            text-decoration: none; font-weight: 600; font-size: 16px;
            box-shadow: 0 4px 12px ${colors.primary}66; transition: all 0.3s ease;
        }
        .cta-button:hover {
            transform: translateY(-2px) scale(1.05); box-shadow: 0 6px 20px ${colors.primary}99;
        }
        .footer { background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0; }
        .logo-container {
            margin-bottom: 20px;
            text-align: center;
        }
        .logo-image {
            max-width: 150px;
            height: auto;
            display: inline-block;
        }
        .signature { margin-bottom: 20px; }
        .signature-name { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
        .signature-title { font-size: 14px; color: #64748b; }
        .contact-info {
            display: flex; justify-content: center; align-items: center;
            flex-wrap: wrap; gap: 16px; margin-top: 16px;
        }
        .contact-item {
            display: flex; align-items: center; color: #475569;
            font-size: 14px; text-decoration: none;
        }
        .contact-item:hover { color: ${colors.primary}; }
        .contact-icon { margin-right: 6px; }
        .social-links { display: flex; justify-content: center; gap: 16px; margin-top: 16px; }
        .social-link {
            display: inline-flex; align-items: center; justify-content: center;
            width: 40px; height: 40px; border-radius: 50%;
            background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%);
            color: #ffffff; text-decoration: none; font-size: 20px;
            transition: all 0.3s ease; box-shadow: 0 2px 8px ${colors.primary}33;
        }
        .social-link img {
            width: 20px !important;
            height: 20px !important;
            display: block !important;
            border: none;
            outline: none;
        }
        .social-link:hover {
            transform: translateY(-3px) scale(1.1); box-shadow: 0 4px 12px ${colors.primary}66;
        }
        @media only screen and (max-width: 600px) {
            body { padding: 20px 10px; }
            .content { padding: 30px 20px; }
            .comparison-grid { grid-template-columns: 1fr; }
            .cta-section { padding: 24px 20px; }
            .contact-info { flex-direction: column; gap: 12px; }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="header-text">${companyName} Example</div>
            <div class="header-subtext">See what I mean</div>
        </div>
        <div class="content">
            <div class="greeting">Hi ${firstName},</div>
            <p class="paragraph">I know you're busy, so I'll keep this short.</p>
            <p class="paragraph">
                Instead of just talking about what we could do for <strong>${companyName}</strong>, I thought I'd show you what I mean.
            </p>
            <div class="comparison-grid">
                <div class="comparison-card before">
                    <div class="comparison-label">Before</div>
                    <div class="comparison-item">Confusing navigation</div>
                    <div class="comparison-item">Generic messaging</div>
                    <div class="comparison-item">Hidden CTAs</div>
                </div>
                <div class="comparison-card after">
                    <div class="comparison-label">After</div>
                    <div class="comparison-item">Clear value proposition</div>
                    <div class="comparison-item">Streamlined CTAs</div>
                    <div class="comparison-item">Trust signals visible</div>
                </div>
            </div>
            <div class="result-banner">
                <div class="result-text">Result</div>
                <div class="result-multiplier">3.4x increase</div>
            </div>
            <p class="paragraph">
                This is the kind of thinking I'd apply to <strong>${companyName}</strong>'s site — completely free to start.
            </p>
            <div class="cta-section">
                <div class="cta-question">Still interested? Just say the word.</div>
                <a href="mailto:${email}?subject=Yes - I'm interested for ${companyName}" class="cta-button">
                    Yes, I'm Interested
                </a>
            </div>
        </div>
        <div class="footer">
            <a href="https://www.geosoftech.com" class="logo-container">
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqNdXdvT7wD9JHTJEC6URa1jEDH7xuDoVjtQ&s" alt="${companyBrand} Logo" class="logo-image" />
            </a>
            <div class="signature">
                <div class="signature-name">${founderName}</div>
                <div class="signature-title">Founder, ${companyBrand}</div>
            </div>
            <div class="contact-info">
              
                <a href="https://${website}" class="contact-item">
                    <span class="contact-icon">🌐</span>
                    ${website}
                </a>
            </div>
            <div class="social-links">
                <a href="https://instagram.com/${instagram.replace('@', '')}" class="social-link" title="Follow us on Instagram" target="_blank">
                    <img src="https://cdn.simpleicons.org/instagram/FFFFFF" alt="Instagram" width="20" height="20" style="display: block; width: 20px; height: 20px;" />
                </a>
                
                <a href="https://linkedin.com/company/${linkedin}" class="social-link" title="Follow us on LinkedIn" target="_blank">
                    <img src="https://cdn.simpleicons.org/linkedin/FFFFFF" alt="LinkedIn" width="20" height="20" style="display: block; width: 20px; height: 20px;" />
                </a>
            </div>
        </div>
    </div>
</body>
</html>
  `.trim()
}

// Generate Follow-up 3 Email (Honest Question)
export function generateFollowUp3Email(data: EmailTemplateData, preview: boolean = false): string {
  const colors = themeColors[data.theme]
  const firstName = preview ? data.firstName : 'there'
  const companyName = preview ? data.companyName : '{{BusinessName}}'
  const phone = data.phone
  const website = data.website
  const email = data.email
  const address = data.address
  const founderName = data.founderName
  const companyBrand = data.companyBrand
  const instagram = data.instagram
  const facebook = data.facebook

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Honest Question - ${firstName}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: #f1f5f9; padding: 40px 20px; line-height: 1.6;
        }
        .email-container {
            max-width: 600px; margin: 0 auto; background: #ffffff;
            border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }
        .header {
            background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%);
            padding: 30px; text-align: center;
        }
        .header-text { color: #ffffff; font-size: 20px; font-weight: 700; }
        .content { padding: 40px 30px; }
        .greeting { font-size: 18px; color: #0f172a; margin-bottom: 20px; }
        .paragraph { font-size: 16px; color: #334155; margin-bottom: 20px; line-height: 1.7; }
        .question-box {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border-left: 4px solid ${colors.accent};
            padding: 24px; margin: 28px 0; border-radius: 12px; text-align: center;
        }
        .question-text {
            font-size: 18px; font-weight: 700; color: #78350f; margin-bottom: 12px;
        }
        .subtitle-text {
            font-size: 14px; color: #92400e; margin-bottom: 20px;
        }
        .options-list {
            background: #ffffff; border-radius: 12px; padding: 24px; margin: 24px 0;
        }
        .option-item {
            display: flex; align-items: flex-start; padding: 16px;
            margin: 12px 0; border-radius: 10px; border: 2px solid #e2e8f0;
            transition: all 0.3s ease;
        }
        .option-item:hover {
            border-color: ${colors.primary}; background: #f8fafc;
        }
        .option-emoji {
            font-size: 28px; margin-right: 16px; min-width: 40px; text-align: center;
        }
        .option-content { flex: 1; }
        .option-title {
            font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 4px;
        }
        .option-description { font-size: 14px; color: #64748b; }
        .cta-section {
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
            padding: 32px; border-radius: 12px; margin: 32px 0;
            text-align: center; border: 2px solid #e2e8f0;
        }
        .cta-text {
            font-size: 16px; color: #334155; margin-bottom: 20px; line-height: 1.6;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%);
            color: #ffffff; padding: 16px 40px; border-radius: 8px;
            text-decoration: none; font-weight: 600; font-size: 16px;
            box-shadow: 0 4px 12px ${colors.primary}66; transition: all 0.3s ease;
            margin: 8px;
        }
        .cta-button:hover {
            transform: translateY(-2px) scale(1.05); box-shadow: 0 6px 20px ${colors.primary}99;
        }
        .footer { background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0; }
        .logo-container {
            margin-bottom: 20px;
            text-align: center;
        }
        .logo-image {
            max-width: 150px;
            height: auto;
            display: inline-block;
        }
        .signature { margin-bottom: 20px; }
        .signature-name { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
        .signature-title { font-size: 14px; color: #64748b; }
        .contact-info {
            display: flex; justify-content: center; align-items: center;
            flex-wrap: wrap; gap: 16px; margin-top: 16px;
        }
        .contact-item {
            display: flex; align-items: center; color: #475569;
            font-size: 14px; text-decoration: none;
        }
        .contact-item:hover { color: ${colors.primary}; }
        .contact-icon { margin-right: 6px; }
        .social-links { display: flex; justify-content: center; gap: 16px; margin-top: 16px; }
        .social-link {
            display: inline-flex; align-items: center; justify-content: center;
            width: 40px; height: 40px; border-radius: 50%;
            background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%);
            color: #ffffff; text-decoration: none; font-size: 20px;
            transition: all 0.3s ease; box-shadow: 0 2px 8px ${colors.primary}33;
        }
        .social-link img {
            width: 20px !important;
            height: 20px !important;
            display: block !important;
            border: none;
            outline: none;
        }
        .social-link:hover {
            transform: translateY(-3px) scale(1.1); box-shadow: 0 4px 12px ${colors.primary}66;
        }
        @media only screen and (max-width: 600px) {
            body { padding: 20px 10px; }
            .content { padding: 30px 20px; }
            .question-box { padding: 20px; }
            .option-item { padding: 12px; }
            .cta-section { padding: 24px 20px; }
            .contact-info { flex-direction: column; gap: 12px; }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="header-text">Honest Question</div>
        </div>
        <div class="content">
            <div class="greeting">Hi ${firstName},</div>
            <div class="question-box">
                <div class="question-text">Was my offer not interesting, or just bad timing?</div>
                <div class="subtitle-text">I'm refining our outreach, so genuinely curious</div>
            </div>
            <p class="paragraph">
                Just reply with one of the options below and I'll know what to do:
            </p>
            <div class="options-list">
                <div class="option-item">
                    <div class="option-emoji">❌</div>
                    <div class="option-content">
                        <div class="option-title">Not interested</div>
                        <div class="option-description">All good, I'll stop following up</div>
                    </div>
                </div>
                <div class="option-item">
                    <div class="option-emoji">⏰</div>
                    <div class="option-content">
                        <div class="option-title">Bad timing</div>
                        <div class="option-description">Want me to check back in a month?</div>
                    </div>
                </div>
                <div class="option-item">
                    <div class="option-emoji">✅</div>
                    <div class="option-content">
                        <div class="option-title">Still interested</div>
                        <div class="option-description">Let's make it happen</div>
                    </div>
                </div>
            </div>
            <div class="cta-section">
                <div class="cta-text">No hard feelings either way. Just click one of these:</div>
                <a href="mailto:${email}?subject=Re: Not interested&body=❌ Not interested" class="cta-button">
                    ❌ Not Interested
                </a>
                <a href="mailto:${email}?subject=Re: Bad timing - check back later&body=⏰ Bad timing" class="cta-button">
                    ⏰ Bad Timing
                </a>
                <a href="mailto:${email}?subject=Re: Still interested for ${companyName}&body=✅ Still interested" class="cta-button">
                    ✅ Still Interested
                </a>
            </div>
        </div>
        <div class="footer">
            <div class="logo-container">
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqNdXdvT7wD9JHTJEC6URa1jEDH7xuDoVjtQ&s" alt="${companyBrand} Logo" class="logo-image" />
            </div>
            <div class="signature">
                <div class="signature-name">${founderName}</div>
                <div class="signature-title">Founder, ${companyBrand}</div>
            </div>
            <div class="contact-info">
                
                <a href="https://${website}" class="contact-item">
                    <span class="contact-icon">🌐</span>
                    ${website}
                </a>
            </div>
            <div class="social-links">
                <a href="https://instagram.com/${instagram.replace('@', '')}" class="social-link" title="Follow us on Instagram" target="_blank">
                    <img src="https://cdn.simpleicons.org/instagram/FFFFFF" alt="Instagram" width="20" height="20" style="display: block; width: 20px; height: 20px;" />
                </a>
                <a href="https://facebook.com/${facebook}" class="social-link" title="Like us on Facebook" target="_blank">👍</a>
            </div>
        </div>
    </div>
</body>
</html>
  `.trim()
}

// Generate Follow-up 4 Email (Last Note)
export function generateFollowUp4Email(data: EmailTemplateData, preview: boolean = false): string {
  const colors = themeColors[data.theme]
  const firstName = preview ? data.firstName : 'there'
  const companyName = preview ? data.companyName : '{{BusinessName}}'
  const phone = data.phone
  const website = data.website
  const email = data.email
  const address = data.address
  const founderName = data.founderName
  const companyBrand = data.companyBrand
  const instagram = data.instagram
  const facebook = data.facebook

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Last Note - ${firstName}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: #f1f5f9; padding: 40px 20px; line-height: 1.6;
        }
        .email-container {
            max-width: 600px; margin: 0 auto; background: #ffffff;
            border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }
        .header {
            background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%);
            padding: 30px; text-align: center;
        }
        .header-text { color: #ffffff; font-size: 20px; font-weight: 700; margin-bottom: 4px; }
        .header-subtext { color: rgba(255, 255, 255, 0.9); font-size: 14px; }
        .content { padding: 40px 30px; }
        .greeting { font-size: 18px; color: #0f172a; margin-bottom: 20px; }
        .paragraph { font-size: 16px; color: #334155; margin-bottom: 20px; line-height: 1.7; }
        .farewell-box {
            background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
            border-left: 4px solid ${colors.primary};
            padding: 20px; margin: 28px 0; border-radius: 12px;
        }
        .farewell-text {
            font-size: 16px; color: #0c4a6e; line-height: 1.6; text-align: center;
        }
        .tips-section { margin: 32px 0; }
        .tips-title {
            font-size: 18px; font-weight: 700; color: #0f172a;
            margin-bottom: 20px; text-align: center;
        }
        .tip-card {
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
            border: 2px solid #e2e8f0; border-radius: 12px;
            padding: 20px; margin: 16px 0; position: relative;
            transition: all 0.3s ease;
        }
        .tip-card:hover {
            border-color: ${colors.primary}; transform: translateY(-2px);
        }
        .tip-number {
            position: absolute; top: -12px; left: 20px;
            background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%);
            color: #ffffff; width: 32px; height: 32px;
            border-radius: 50%; display: flex; align-items: center;
            justify-content: center; font-weight: 700; font-size: 14px;
        }
        .tip-title {
            font-size: 16px; font-weight: 700; color: #0f172a;
            margin-bottom: 8px; padding-top: 8px;
        }
        .tip-description { font-size: 14px; color: #475569; line-height: 1.6; }
        .footer { background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0; }
        .logo-container {
            margin-bottom: 20px;
            text-align: center;
        }
        .logo-image {
            max-width: 150px;
            height: auto;
            display: inline-block;
        }
        .signature { margin-bottom: 20px; }
        .signature-name { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
        .signature-title { font-size: 14px; color: #64748b; }
        .contact-info {
            display: flex; justify-content: center; align-items: center;
            flex-wrap: wrap; gap: 16px; margin-top: 16px;
        }
        .contact-item {
            display: flex; align-items: center; color: #475569;
            font-size: 14px; text-decoration: none;
        }
        .contact-item:hover { color: ${colors.primary}; }
        .contact-icon { margin-right: 6px; }
        .social-links { display: flex; justify-content: center; gap: 16px; margin-top: 16px; }
        .social-link {
            display: inline-flex; align-items: center; justify-content: center;
            width: 40px; height: 40px; border-radius: 50%;
            background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%);
            color: #ffffff; text-decoration: none; font-size: 20px;
            transition: all 0.3s ease; box-shadow: 0 2px 8px ${colors.primary}33;
        }
        .social-link img {
            width: 20px !important;
            height: 20px !important;
            display: block !important;
            border: none;
            outline: none;
        }
        .social-link:hover {
            transform: translateY(-3px) scale(1.1); box-shadow: 0 4px 12px ${colors.primary}66;
        }
        @media only screen and (max-width: 600px) {
            body { padding: 20px 10px; }
            .content { padding: 30px 20px; }
            .tip-card { padding: 16px; }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="header-text">Last Note From Me</div>
            <div class="header-subtext">Promise!</div>
        </div>
        <div class="content">
            <div class="greeting">Hi ${firstName},</div>
            <p class="paragraph">This will be my last email — promise!</p>
            <div class="farewell-box">
                <div class="farewell-text">
                    I know your inbox is probably flooded, and maybe a free homepage redesign just isn't a priority for <strong>${companyName}</strong> right now. Totally fair.
                </div>
            </div>
            <p class="paragraph">
                But before I close your file, I wanted to leave you with <strong>3 quick wins</strong> you can implement yourself (no us required):
            </p>
            <div class="tips-section">
                <div class="tips-title">Free Quick Wins for ${companyName}</div>
                <div class="tip-card">
                    <div class="tip-number">1</div>
                    <div class="tip-title">Hero Section</div>
                    <div class="tip-description">
                        Replace generic taglines with a specific outcome. Instead of "We help businesses grow," try something measurable and time-bound.
                    </div>
                </div>
                <div class="tip-card">
                    <div class="tip-number">2</div>
                    <div class="tip-title">Social Proof</div>
                    <div class="tip-description">
                        Add client logos or testimonials above the fold. Trust signals are conversion gold.
                    </div>
                </div>
                <div class="tip-card">
                    <div class="tip-number">3</div>
                    <div class="tip-title">Mobile CTA</div>
                    <div class="tip-description">
                        Make sure your "Contact Us" button is thumb-reachable on mobile. Test it on your phone right now.
                    </div>
                </div>
            </div>
            <p class="paragraph">
                Feel free to use these ideas. If you ever need help executing, you know where to find me.
            </p>
        </div>
        <div class="footer">
            <div class="logo-container">
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqNdXdvT7wD9JHTJEC6URa1jEDH7xuDoVjtQ&s" alt="${companyBrand} Logo" class="logo-image" />
            </div>
            <div class="signature">
                <div class="signature-name">${founderName}</div>
                <div class="signature-title">Founder, ${companyBrand}</div>
            </div>
            <div class="contact-info">
               
                <a href="https://${website}" class="contact-item">
                    <span class="contact-icon">🌐</span>
                    ${website}
                </a>
            </div>
            <div class="social-links">
                <a href="https://instagram.com/${instagram.replace('@', '')}" class="social-link" title="Follow us on Instagram" target="_blank">
                    <img src="https://cdn.simpleicons.org/instagram/FFFFFF" alt="Instagram" width="20" height="20" style="display: block; width: 20px; height: 20px;" />
                </a>
                <a href="https://facebook.com/${facebook}" class="social-link" title="Like us on Facebook" target="_blank">👍</a>
            </div>
        </div>
    </div>
</body>
</html>
  `.trim()
}

// Generate Re-Engagement Email
export function generateReEngagementEmail(data: EmailTemplateData, preview: boolean = false): string {
  const colors = themeColors[data.theme]
  const firstName = preview ? data.firstName : 'there'
  const companyName = preview ? data.companyName : '{{BusinessName}}'
  const phone = data.phone
  const website = data.website
  const email = data.email
  const address = data.address
  const founderName = data.founderName
  const companyBrand = data.companyBrand
  const instagram = data.instagram
  const facebook = data.facebook
  const linkedin = data.linkedin

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Case Study for ${companyName}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: #f1f5f9; padding: 40px 20px; line-height: 1.6;
        }
        .email-container {
            max-width: 600px; margin: 0 auto; background: #ffffff;
            border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }
        .header {
            background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%);
            padding: 30px; text-align: center;
        }
        .header-text { color: #ffffff; font-size: 20px; font-weight: 700; margin-bottom: 4px; }
        .header-subtext { color: rgba(255, 255, 255, 0.9); font-size: 14px; }
        .content { padding: 40px 30px; }
        .greeting { font-size: 18px; color: #0f172a; margin-bottom: 20px; }
        .paragraph { font-size: 16px; color: #334155; margin-bottom: 20px; line-height: 1.7; }
        .case-study-section {
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
            border: 2px solid #e2e8f0; border-radius: 12px;
            padding: 32px; margin: 28px 0;
        }
        .case-study-label {
            display: inline-block; background: ${colors.primary};
            color: #ffffff; padding: 6px 16px; border-radius: 6px;
            font-size: 12px; font-weight: 700; text-transform: uppercase;
            letter-spacing: 0.5px; margin-bottom: 20px;
        }
        .case-study-title {
            font-size: 20px; font-weight: 700; color: #0f172a;
            margin-bottom: 24px; text-align: center;
        }
        .result-banner {
            background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
            border: 3px solid #10b981; border-radius: 12px;
            padding: 24px; margin: 24px 0; text-align: center;
        }
        .result-label {
            font-size: 14px; font-weight: 700; color: #065f46;
            text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;
        }
        .result-text {
            font-size: 28px; font-weight: 900; color: #10b981;
            text-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
            margin-bottom: 4px;
        }
        .cta-section {
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
            padding: 32px; border-radius: 12px; margin: 32px 0;
            text-align: center; border: 2px solid #e2e8f0;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%);
            color: #ffffff; padding: 16px 40px; border-radius: 8px;
            text-decoration: none; font-weight: 600; font-size: 16px;
            box-shadow: 0 4px 12px ${colors.primary}66; transition: all 0.3s ease;
            margin: 8px;
        }
        .cta-button:hover {
            transform: translateY(-2px) scale(1.05); box-shadow: 0 6px 20px ${colors.primary}99;
        }
        .footer { background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0; }
        .logo-container {
            margin-bottom: 20px;
            text-align: center;
        }
        .logo-image {
            max-width: 150px;
            height: auto;
            display: inline-block;
        }
        .signature { margin-bottom: 20px; }
        .signature-name { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
        .signature-title { font-size: 14px; color: #64748b; }
        .contact-info {
            display: flex; justify-content: center; align-items: center;
            flex-wrap: wrap; gap: 16px; margin-top: 16px;
        }
        .contact-item {
            display: flex; align-items: center; color: #475569;
            font-size: 14px; text-decoration: none;
        }
        .contact-item:hover { color: ${colors.primary}; }
        .contact-icon { margin-right: 6px; }
        .social-links { display: flex; justify-content: center; gap: 16px; margin-top: 16px; }
        .social-link {
            display: inline-flex; align-items: center; justify-content: center;
            width: 40px; height: 40px; border-radius: 50%;
            background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%);
            color: #ffffff; text-decoration: none; font-size: 20px;
            transition: all 0.3s ease; box-shadow: 0 2px 8px ${colors.primary}33;
        }
        .social-link img {
            width: 20px !important;
            height: 20px !important;
            display: block !important;
            border: none;
            outline: none;
        }
        .social-link:hover {
            transform: translateY(-3px) scale(1.1); box-shadow: 0 4px 12px ${colors.primary}66;
        }
        @media only screen and (max-width: 600px) {
            body { padding: 20px 10px; }
            .content { padding: 30px 20px; }
            .cta-section { padding: 24px 20px; }
            .contact-info { flex-direction: column; gap: 12px; }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="header-text">Fresh Case Study</div>
            <div class="header-subtext">You might find this interesting</div>
        </div>
        <div class="content">
            <div class="greeting">Hi ${firstName},</div>
            <p class="paragraph">
                I know we chatted (or tried to) a while back about <strong>${companyName}</strong>'s website.
            </p>
            <div class="case-study-section">
                <span class="case-study-label">Recent Project</span>
                <div class="case-study-title">Similar Challenge, Proven Results</div>
                <div class="result-banner">
                    <div class="result-label">Result</div>
                    <div class="result-text">4x increase</div>
                    <div style="font-size: 14px; color: #065f46;">in demo requests within 6 weeks</div>
                </div>
            </div>
            <p class="paragraph">
                If you're facing similar challenges, let's talk. If not, no worries — just thought it might be relevant for <strong>${companyName}</strong>.
            </p>
            <div class="cta-section">
                <div style="font-size: 16px; color: #334155; margin-bottom: 20px;">
                    <strong>Want to see the full breakdown?</strong>
                </div>
                <a href="mailto:${email}?subject=Yes - Send me the ${companyName} case study" class="cta-button">
                    📊 Send Me the Case Study
                </a>
            </div>
        </div>
        <div class="footer">
            <div class="logo-container">
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqNdXdvT7wD9JHTJEC6URa1jEDH7xuDoVjtQ&s" alt="${companyBrand} Logo" class="logo-image" />
            </div>
            <div class="signature">
                <div class="signature-name">${founderName}</div>
                <div class="signature-title">Founder, ${companyBrand}</div>
            </div>
            <div class="contact-info">
             
                <span style="color: #cbd5e1;">|</span>
                <a href="https://${website}" class="contact-item">
                    <span class="contact-icon">🌐</span>
                    ${website}
                </a>
            </div>
            <div class="social-links">
                <a href="https://instagram.com/${instagram.replace('@', '')}" class="social-link" title="Follow us on Instagram" target="_blank">
                    <img src="https://cdn.simpleicons.org/instagram/FFFFFF" alt="Instagram" width="20" height="20" style="display: block; width: 20px; height: 20px;" />
                </a>
               <a href="https://linkedin.com/company/${linkedin}" class="social-link" title="Follow us on LinkedIn" target="_blank">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                </a>
            </div>
        </div>
    </div>
</body>
</html>
  `.trim()
}

