import Stripe from 'stripe'
import type { CartItem } from '@/types'

// Server-side Stripe client
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
  typescript: true,
})

// Create line items for Stripe checkout
export function createLineItems(items: CartItem[]): Stripe.Checkout.SessionCreateParams.LineItem[] {
  return items.map((item) => ({
    price_data: {
      currency: 'uah',
      product_data: {
        name: item.name,
        images: item.image ? [item.image] : [],
        metadata: {
          productId: item.id,
          size: item.size || '',
          color: item.color || '',
        },
      },
      unit_amount: Math.round(item.price * 100), // Stripe uses cents
    },
    quantity: item.quantity,
  }))
}

// Create checkout session
export async function createCheckoutSession(
  items: CartItem[],
  customerEmail?: string,
  metadata?: Record<string, string>
): Promise<Stripe.Checkout.Session> {
  const lineItems = createLineItems(items)

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
    customer_email: customerEmail,
    metadata: metadata,
    shipping_address_collection: {
      allowed_countries: ['UA'],
    },
    phone_number_collection: {
      enabled: true,
    },
    locale: 'auto',
    currency: 'uah',
  })

  return session
}

// Retrieve checkout session
export async function getCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
  return stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items', 'customer'],
  })
}

// Create payment intent for custom payment flow
export async function createPaymentIntent(
  amount: number,
  metadata?: Record<string, string>
): Promise<Stripe.PaymentIntent> {
  return stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: 'uah',
    automatic_payment_methods: {
      enabled: true,
    },
    metadata,
  })
}

// Webhook signature verification
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET || ''
  )
}
