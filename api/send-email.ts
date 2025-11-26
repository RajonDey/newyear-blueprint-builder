import { VercelRequest, VercelResponse } from '@vercel/node';

interface EmailData {
  to: string;
  userName: string;
  year: number;
  downloadLinks?: {
    pdf?: string;
    notion?: string;
  };
}

/**
 * Sends a confirmation email to the user after successful payment
 * Supports Resend and SendGrid email services
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, userName, year, downloadLinks }: EmailData = req.body;

  if (!to || !userName) {
    return res.status(400).json({ error: 'Missing required fields: to, userName' });
  }

  const emailService = process.env.EMAIL_SERVICE || 'resend'; // 'resend' or 'sendgrid'
  const apiKey = emailService === 'resend' 
    ? process.env.RESEND_API_KEY 
    : process.env.SENDGRID_API_KEY;

  if (!apiKey) {
    console.error(`Missing ${emailService.toUpperCase()}_API_KEY environment variable`);
    return res.status(500).json({ 
      error: 'Email service not configured',
      service: emailService 
    });
  }

  try {
    if (emailService === 'resend') {
      await sendWithResend(to, userName, year, downloadLinks, apiKey);
    } else {
      await sendWithSendGrid(to, userName, year, downloadLinks, apiKey);
    }

    return res.status(200).json({ 
      success: true,
      message: 'Email sent successfully' 
    });
  } catch (error) {
    console.error('Email sending error:', error);
    return res.status(500).json({ 
      error: 'Failed to send email',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function sendWithResend(
  to: string,
  userName: string,
  year: number,
  downloadLinks: EmailData['downloadLinks'],
  apiKey: string
) {
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@yearinreview.online';
  
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [to],
      subject: `Your ${year} Success Blueprint is Ready! 🎉`,
      html: generateEmailHTML(userName, year, downloadLinks),
      text: generateEmailText(userName, year, downloadLinks),
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Resend API error: ${error.message || response.statusText}`);
  }

  return await response.json();
}

async function sendWithSendGrid(
  to: string,
  userName: string,
  year: number,
  downloadLinks: EmailData['downloadLinks'],
  apiKey: string
) {
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@yearinreview.online';
  
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      personalizations: [{
        to: [{ email: to }],
        subject: `Your ${year} Success Blueprint is Ready! 🎉`,
      }],
      from: { email: fromEmail },
      content: [
        {
          type: 'text/plain',
          value: generateEmailText(userName, year, downloadLinks),
        },
        {
          type: 'text/html',
          value: generateEmailHTML(userName, year, downloadLinks),
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SendGrid API error: ${error || response.statusText}`);
  }

  return { success: true };
}

function generateEmailHTML(
  userName: string,
  year: number,
  downloadLinks?: EmailData['downloadLinks']
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Your ${year} Success Blueprint is Ready!</h1>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 18px; margin-top: 0;">Hi ${userName},</p>
          
          <p>Congratulations! Your personalized ${year} Success Blueprint has been generated and is ready for download.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6366f1;">
            <h2 style="margin-top: 0; color: #6366f1;">What's Included:</h2>
            <ul style="padding-left: 20px;">
              <li>📄 Premium PDF with your complete plan</li>
              <li>📝 Notion template for progress tracking</li>
              <li>✅ All your goals, actions, and habits organized</li>
            </ul>
          </div>
          
          ${downloadLinks?.pdf ? `
            <div style="text-align: center; margin: 30px 0;">
              <a href="${downloadLinks.pdf}" style="display: inline-block; background: #6366f1; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px;">
                Download PDF
              </a>
            </div>
          ` : ''}
          
          ${downloadLinks?.notion ? `
            <div style="text-align: center; margin: 30px 0;">
              <a href="${downloadLinks.notion}" style="display: inline-block; background: #8b5cf6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px;">
                Download Notion Template
              </a>
            </div>
          ` : ''}
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            If you have any questions or need support, please don't hesitate to reach out to us.
          </p>
          
          <p style="margin-top: 30px;">
            Here's to making ${year} your best year yet! 🚀
          </p>
          
          <p style="margin-top: 20px;">
            Best regards,<br>
            The ${year} Success Blueprint Team
          </p>
        </div>
      </body>
    </html>
  `;
}

function generateEmailText(
  userName: string,
  year: number,
  downloadLinks?: EmailData['downloadLinks']
): string {
  let text = `🎉 Your ${year} Success Blueprint is Ready!\n\n`;
  text += `Hi ${userName},\n\n`;
  text += `Congratulations! Your personalized ${year} Success Blueprint has been generated and is ready for download.\n\n`;
  text += `What's Included:\n`;
  text += `- Premium PDF with your complete plan\n`;
  text += `- Notion template for progress tracking\n`;
  text += `- All your goals, actions, and habits organized\n\n`;
  
  if (downloadLinks?.pdf) {
    text += `Download PDF: ${downloadLinks.pdf}\n\n`;
  }
  
  if (downloadLinks?.notion) {
    text += `Download Notion Template: ${downloadLinks.notion}\n\n`;
  }
  
  text += `If you have any questions or need support, please don't hesitate to reach out to us.\n\n`;
  text += `Here's to making ${year} your best year yet! 🚀\n\n`;
  text += `Best regards,\n`;
  text += `The ${year} Success Blueprint Team\n`;
  
  return text;
}

