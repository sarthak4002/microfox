import { NextApiRequest, NextApiResponse } from 'next';
import { createSESSdk } from '@microfox/aws-ses';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Initialize the SES SDK with environment variables
    const ses = createSESSdk({
      accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY!,
      region: process.env.AWS_SES_REGION || 'us-east-1',
    });

    // Get email parameters from request body
    const { sender, recipient, subject, bodyText, bodyHtml, displayName } =
      req.body;

    // Validate required fields
    if (!sender || !recipient || !subject || (!bodyText && !bodyHtml)) {
      return res.status(400).json({
        error:
          'Missing required fields. Required: sender, recipient, subject, and either bodyText or bodyHtml',
      });
    }

    // Send the email
    const response = await ses.sendEmail({
      sender,
      recipient,
      subject,
      bodyText,
      displayName,
    });

    return res.status(200).json({
      message: 'Email sent successfully',
      messageId: response.SendEmailResponse.SendEmailResult.MessageId,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({
      error: 'Failed to send email',
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
