import { VercelRequest, VercelResponse } from "@vercel/node";

interface LemonSqueezyOrder {
  data: {
    id: string;
    attributes: {
      status: string;
      order_number: number;
      user_email: string;
      customer_id: number;
      total: number;
      created_at: string;
    };
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { orderId, checkoutId } = req.body;

  // Support both order_id (preferred) and checkout_id (legacy)
  const paymentIdentifier = orderId || checkoutId;
  const isOrderId = !!orderId;

  if (!paymentIdentifier) {
    return res.status(400).json({ error: "Missing order ID or checkout ID" });
  }

  const apiKey = process.env.LEMON_SQUEEZY_API_KEY;

  if (!apiKey) {
    console.error("Missing LEMON_SQUEEZY_API_KEY environment variable");
    return res.status(500).json({ error: "Payment verification unavailable" });
  }

  try {
    // Verify payment with Lemon Squeezy API
    // Use order endpoint if order_id provided, otherwise use checkout endpoint
    const apiEndpoint = isOrderId
      ? `https://api.lemonsqueezy.com/v1/orders/${paymentIdentifier}`
      : `https://api.lemonsqueezy.com/v1/checkouts/${paymentIdentifier}`;

    const response = await fetch(apiEndpoint, {
      headers: {
        Accept: "application/vnd.api+json",
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lemon Squeezy API error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        paymentIdentifier,
        isOrderId,
      });

      if (response.status === 404) {
        return res.status(404).json({
          error: isOrderId
            ? "Order not found. Please contact support."
            : "Checkout not found. Please contact support.",
          paymentIdentifier,
        });
      }

      if (response.status === 401) {
        return res.status(500).json({
          error: "Payment service configuration error. Please contact support.",
        });
      }

      return res.status(400).json({
        error: "Unable to verify payment. Please try again or contact support.",
        statusCode: response.status,
      });
    }

    const data: LemonSqueezyOrder = await response.json();

    // Check if payment is complete
    const status = data.data.attributes.status;
    const isPaid = status === "paid" || status === "success";

    if (!isPaid) {
      return res.status(402).json({
        error: "Payment not completed",
        status,
      });
    }

    // Generate one-time download token (expires in 24 hours)
    const downloadToken = generateToken();
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // In a real app, store this in a database or Redis
    // For now, we'll trust the frontend to validate
    return res.status(200).json({
      verified: true,
      status: status,
      downloadToken,
      expiresAt,
      orderNumber: data.data.attributes.order_number,
      email: data.data.attributes.user_email,
      total: data.data.attributes.total,
    });
  } catch (error) {
    console.error("Payment verification exception:", error);

    // Check for network errors
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return res.status(503).json({
        error:
          "Payment service temporarily unavailable. Please try again in a moment.",
      });
    }

    return res.status(500).json({
      error: "Verification failed. Please contact support if issue persists.",
    });
  }
}

function generateToken(): string {
  return `token_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}
