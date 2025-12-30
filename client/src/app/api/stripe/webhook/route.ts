import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { constructWebhookEvent } from '@/lib/stripe/client'

// Вебхук має отримувати сире тіло запиту
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  // Stripe надсилає підпис у заголовку
  const signature = req.headers.get('stripe-signature') || ''

  // Читаємо сирий текст тіла (не JSON.parse!)
  const payload = await req.text()

  let event: Stripe.Event
  try {
    event = constructWebhookEvent(payload, signature)
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        // TODO: оновити статус замовлення у Directus
        break
      }
      case 'payment_intent.succeeded': {
        // TODO: позначити оплату як оплачено (paid)
        break
      }
      case 'payment_intent.payment_failed': {
        // TODO: позначити оплату як failed
        break
      }
      default:
        break
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (e) {
    return NextResponse.json({ error: 'Webhook handler error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ ok: true })
}
