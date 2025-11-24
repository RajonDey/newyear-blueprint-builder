import { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

interface WebhookPayload {
  meta: {
    event_name: string;
    custom_data?: {
      user_data?: string;
    };
  };
  data: {
    id: string;
    attributes: {
      status: string;
      user_email: string;
      order_number: number;
    };
  };
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const signature = req.headers['x-signature'] as string;
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;

  if (!secret) {
    console.error('Missing LEMON_SQUEEZY_WEBHOOK_SECRET');
    return res.status(500).json({ error: 'Webhook not configured' });
  }

  // Verify webhook signature
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(JSON.stringify(req.body)).digest('hex');

  if (signature !== digest) {
    console.error('Invalid webhook signature');
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const payload: WebhookPayload = req.body;

  // Handle order_created event
  if (payload.meta.event_name === 'order_created') {
    const order = payload.data.attributes;
    
    console.log('New order received:', {
      orderId: payload.data.id,
      orderNumber: order.order_number,
      email: order.user_email,
      status: order.status,
      timestamp: new Date().toISOString(),
    });

    try {
      // Here you could:
      // 1. Send confirmation email via Resend/SendGrid
      // 2. Store order in database
      // 3. Trigger PDF email delivery
      // 4. Update analytics

      // For now, just log it
      return res.status(200).json({ received: true });
    } catch (webhookError) {
      console.error('Error processing order webhook:', {
        orderId: payload.data.id,
        error: webhookError,
      });
      // Return 200 to prevent retries for processing errors
      return res.status(200).json({ received: true, error: 'Processing error' });
    }
  }

  // Handle subscription_created event (if you add subscriptions later)
  if (payload.meta.event_name === 'subscription_created') {
    console.log('New subscription:', payload.data.id);
    return res.status(200).json({ received: true });
  }

  // Unknown event type
  console.log('Unknown webhook event:', payload.meta.event_name);
  return res.status(200).json({ received: true });
}
