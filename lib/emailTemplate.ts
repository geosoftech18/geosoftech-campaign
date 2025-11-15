export interface EmailTemplateData {
  firstName: string
  companyName: string
  phone: string
  website: string
  email: string
  address: string
  founderName: string
  companyBrand: string
  instagram: string
  facebook: string
  linkedin: string
  theme: 'blue' | 'green' | 'purple' | 'orange' | 'slate' | 'red'
}

export const themeColors = {
  blue: {
    primary: '#2563eb',
    primaryDark: '#1e40af',
    light: '#eff6ff',
    lighter: '#dbeafe',
    accent: '#60a5fa',
    text: '#1e40af',
  },
  green: {
    primary: '#16a34a',
    primaryDark: '#15803d',
    light: '#f0fdf4',
    lighter: '#dcfce7',
    accent: '#4ade80',
    text: '#166534',
  },
  purple: {
    primary: '#9333ea',
    primaryDark: '#7e22ce',
    light: '#faf5ff',
    lighter: '#f3e8ff',
    accent: '#c084fc',
    text: '#6b21a8',
  },
  orange: {
    primary: '#ea580c',
    primaryDark: '#c2410c',
    light: '#fff7ed',
    lighter: '#ffedd5',
    accent: '#fb923c',
    text: '#9a3412',
  },
  slate: {
    primary: '#475569',
    primaryDark: '#334155',
    light: '#f8fafc',
    lighter: '#f1f5f9',
    accent: '#64748b',
    text: '#1e293b',
  },
  red: {
    primary: '#dc2626',
    primaryDark: '#b91c1c',
    light: '#fef2f2',
    lighter: '#fee2e2',
    accent: '#f87171',
    text: '#991b1b',
  },
}

// Generate HTML with placeholders for actual email sending
export function generateEmailHTML(data: EmailTemplateData, preview: boolean = false): string {
  const colors = themeColors[data.theme]
  
  // For preview, use actual data; for sending, use placeholders
  // Only {{BusinessName}} is supported by the email system, so we use that
  const firstName = preview ? data.firstName : 'there' // Generic greeting since FirstName isn't available
  const companyName = preview ? data.companyName : '{{BusinessName}}'
  // Sender contact info is always the same, so use actual values
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
    <title>Exclusive Website Prototype Offer for ${companyName}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #1e293b;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            padding: 20px;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%);
            padding: 40px 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: pulse 3s ease-in-out infinite;
        }
        @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.1); opacity: 0.3; }
        }
        .header-content {
            position: relative;
            z-index: 1;
        }
        .company-name {
            font-size: 28px;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 8px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header-subtitle {
            font-size: 16px;
            color: rgba(255,255,255,0.9);
            font-weight: 500;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 20px;
            font-weight: 600;
            color: #0f172a;
            margin-bottom: 24px;
        }
        .intro-text {
            font-size: 16px;
            color: #475569;
            margin-bottom: 24px;
            line-height: 1.7;
        }
        .highlight-box {
            background: linear-gradient(135deg, ${colors.light} 0%, ${colors.lighter} 100%);
            border-left: 4px solid ${colors.primary};
            padding: 24px;
            margin: 28px 0;
            border-radius: 8px;
        }
        .highlight-box h2 {
            font-size: 18px;
            color: ${colors.text};
            margin-bottom: 16px;
            font-weight: 700;
        }
        .highlight-text {
            color: ${colors.text};
            font-size: 15px;
            line-height: 1.7;
        }
        .deliverables {
            background: #ffffff;
            border-radius: 8px;
            padding: 20px;
            margin-top: 16px;
        }
        .deliverable-item {
            display: flex;
            align-items: start;
            margin-bottom: 16px;
            padding-bottom: 16px;
            border-bottom: 1px solid #e2e8f0;
        }
        .deliverable-item:last-child {
            margin-bottom: 0;
            padding-bottom: 0;
            border-bottom: none;
        }
        .checkmark {
            width: 24px;
            height: 24px;
            background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
            flex-shrink: 0;
            box-shadow: 0 2px 4px rgba(34, 197, 94, 0.3);
        }
        .checkmark::after {
            content: '✓';
            color: #ffffff;
            font-weight: bold;
            font-size: 14px;
        }
        .deliverable-text {
            font-size: 15px;
            color: #334155;
            font-weight: 500;
            line-height: 1.5;
        }
        .features-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin: 24px 0;
        }
        .feature-card {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            transition: all 0.3s ease;
        }
        .feature-card:hover {
            border-color: ${colors.primary};
            box-shadow: 0 4px 12px ${colors.primary}1A;
            transform: translateY(-5px);
        }
        .feature-icon {
            font-size: 24px;
            margin-bottom: 8px;
        }
        .feature-title {
            font-size: 14px;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 4px;
        }
        .feature-desc {
            font-size: 13px;
            color: #64748b;
            line-height: 1.4;
        }
        .stats-banner {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            padding: 24px;
            border-radius: 8px;
            margin: 28px 0;
            text-align: center;
            color: #ffffff;
            position: relative;
            overflow: hidden;
        }
        .stat {
            display: inline-block;
            margin: 0 20px;
            position: relative;
            z-index: 1;
        }
        .stat-number {
            font-size: 32px;
            font-weight: 700;
            color: ${colors.accent};
            display: block;
        }
        .stat-label {
            font-size: 14px;
            color: #cbd5e1;
            margin-top: 4px;
        }
        .cta-section {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            padding: 32px;
            border-radius: 12px;
            margin: 32px 0;
            text-align: center;
            border: 2px solid #fbbf24;
        }
        .cta-title {
            font-size: 22px;
            font-weight: 700;
            color: #92400e;
            margin-bottom: 12px;
        }
        .cta-text {
            font-size: 16px;
            color: #78350f;
            margin-bottom: 20px;
            line-height: 1.6;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%);
            color: #ffffff;
            padding: 16px 40px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 4px 12px ${colors.primary}66;
            transition: all 0.3s ease;
        }
        .cta-button:hover {
            transform: translateY(-2px) scale(1.05);
            box-shadow: 0 6px 20px ${colors.primary}99;
        }
        .cta-contact-box {
            background: #ffffff;
            border-radius: 8px;
            padding: 20px;
            margin-top: 20px;
            text-align: left;
        }
        .cta-contact-item {
            display: flex;
            align-items: center;
            margin: 12px 0;
            color: #475569;
            font-size: 15px;
        }
        .cta-contact-icon {
            margin-right: 12px;
            font-size: 18px;
        }
        .footer {
            background: #f8fafc;
            padding: 32px 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        .logo-container {
            margin-bottom: 24px;
            text-align: center;
        }
        .logo-image {
            max-width: 200px;
            height: auto;
            display: inline-block;
        }
        .signature {
            margin-bottom: 24px;
        }
        .signature-name {
            font-size: 18px;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 4px;
        }
        .signature-title {
            font-size: 14px;
            color: #64748b;
            margin-bottom: 2px;
        }
        .contact-info {
            display: flex;
            justify-content: center;
            align-items: center;
            flex-wrap: wrap;
            gap: 16px;
            margin-top: 16px;
        }
        .contact-item {
            display: flex;
            align-items: center;
            color: #475569;
            font-size: 14px;
            text-decoration: none;
        }
        .contact-item:hover {
            color: ${colors.primary};
        }
        .contact-icon {
            margin-right: 6px;
        }
        .social-links {
            display: flex;
            justify-content: center;
            gap: 16px;
            margin-top: 20px;
        }
        .social-link {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%);
            color: #ffffff;
            text-decoration: none;
            font-size: 20px;
            transition: all 0.3s ease;
            box-shadow: 0 2px 8px ${colors.primary}33;
        }
        .social-link:hover {
            transform: translateY(-3px) scale(1.1);
            box-shadow: 0 4px 12px ${colors.primary}66;
        }
        @media only screen and (max-width: 600px) {
            .email-container {
                border-radius: 0;
            }
            .header {
                padding: 30px 20px;
            }
            .company-name {
                font-size: 24px;
            }
            .content {
                padding: 30px 20px;
            }
            .features-grid {
                grid-template-columns: 1fr;
            }
            .stat {
                display: block;
                margin: 12px 0;
            }
            .cta-section {
                padding: 24px 20px;
            }
            .cta-contact-box {
                padding: 16px;
            }
            .contact-info {
                flex-direction: column;
                gap: 12px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="header-content">
                <div class="company-name">${companyName}</div>
                <div class="header-subtitle">Exclusive Website Prototype Offer</div>
            </div>
        </div>

        <div class="content">
            <div class="greeting">Hi ${firstName},</div>

            <p class="intro-text">
                I spent 10 minutes on <strong>${companyName}'s</strong> website today and saw real potential — but also <strong>3 conversion gaps</strong> that are likely costing you leads.
            </p>

            <p class="intro-text">
                The good news? <strong>They're fixable.</strong>
            </p>

            <div class="highlight-box">
                <h2>Here's what I'm offering:</h2>
                <p class="highlight-text">
                    I'll create a <strong>custom homepage prototype</strong> for ${companyName} — completely free. Not a template. A real design based on your brand, audience, and how your best customers think.
                </p>
            </div>

            <div style="margin: 32px 0;">
                <h3 style="font-size: 18px; color: #0f172a; margin-bottom: 20px; font-weight: 700;">
                    What you'll get <span style="color: ${colors.primary};">(within 24 hours)</span>:
                </h3>
                <div class="deliverables">
                    <div class="deliverable-item">
                        <div class="checkmark"></div>
                        <div class="deliverable-text">Modern UI designed for trust + conversions</div>
                    </div>
                    <div class="deliverable-item">
                        <div class="checkmark"></div>
                        <div class="deliverable-text">Mobile-first layout that actually works</div>
                    </div>
                    <div class="deliverable-item">
                        <div class="checkmark"></div>
                        <div class="deliverable-text">Clear CTAs that guide visitors to inquire</div>
                    </div>
                    <div class="deliverable-item">
                        <div class="checkmark"></div>
                        <div class="deliverable-text">3-point audit showing what's holding you back right now</div>
                    </div>
                </div>
            </div>

            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon">🎨</div>
                    <div class="feature-title">Brand-Aligned Design</div>
                    <div class="feature-desc">Perfectly matches your identity</div>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">📱</div>
                    <div class="feature-title">Mobile Optimized</div>
                    <div class="feature-desc">Looks great on all devices</div>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">⚡</div>
                    <div class="feature-title">Fast Delivery</div>
                    <div class="feature-desc">Ready in 24 hours</div>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">🎯</div>
                    <div class="feature-title">Conversion Focused</div>
                    <div class="feature-desc">Built to generate leads</div>
                </div>
            </div>

            <div class="stats-banner">
                <div class="stat">
                    <span class="stat-number">350+</span>
                    <span class="stat-label">Brands Helped</span>
                </div>
                <div class="stat">
                    <span class="stat-number">2018</span>
                    <span class="stat-label">Since</span>
                </div>
            </div>

            <p class="intro-text">
                <strong>No commitment. No sales pitch. Just value first.</strong>
            </p>

            <p class="intro-text">
                Use it as inspiration, share it with your team, or let us build it — your call.
            </p>

            <p class="intro-text">
                I've done this for <strong>350+ brands since 2018</strong>. Happy to do the same for ${companyName}.
            </p>

            <div class="cta-section">
                <div class="cta-title">Want me to send it over?</div>
                <div class="cta-text">
                    Just reply <strong>"Yes"</strong> or let me know a good time to share.
                </div>
                <a href="https://www.geosoftech.com/services/webdevelopment" class="cta-button">
                    Yes, Send the Prototype
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

            <div style="height: 1px; background: linear-gradient(to right, transparent, #cbd5e1, transparent); margin: 24px 0;"></div>

            <p class="intro-text" style="text-align: center; color: #64748b; font-size: 14px;">
                Looking forward to helping ${companyName} reach its full potential.
            </p>
        </div>

        <div class="footer">
            <a href="https://www.geosoftech.com" class="logo-container">
                <img src="https://www.geosoftech.com/logo/logo.png" alt="${companyBrand} Logo" class="logo-image" />
            </a>
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
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
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

