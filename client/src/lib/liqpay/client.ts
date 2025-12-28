import crypto from 'crypto'
import type { CartItem, Customer, Order } from '@/types'

// LiqPay configuration
const LIQPAY_PUBLIC_KEY = process.env.LIQPAY_PUBLIC_KEY || ''
const LIQPAY_PRIVATE_KEY = process.env.LIQPAY_PRIVATE_KEY || ''
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// LiqPay action types
type LiqPayAction = 'pay' | 'hold' | 'subscribe' | 'paydonate'

// LiqPay payment request params
interface LiqPayParams {
  version: number
  public_key: string
  action: LiqPayAction
  amount: number
  currency: string
  description: string
  order_id: string
  result_url?: string
  server_url?: string
  language?: 'uk' | 'en' | 'ru'
  sandbox?: number
  customer?: string
  customer_user_id?: string
  sender_first_name?: string
  sender_last_name?: string
  sender_email?: string
  sender_phone?: string
}

// LiqPay callback data
export interface LiqPayCallback {
  payment_id: number
  action: string
  status: string
  version: number
  type: string
  paytype: string
  public_key: string
  acq_id: number
  order_id: string
  liqpay_order_id: string
  description: string
  sender_phone: string
  sender_card_mask2: string
  sender_card_bank: string
  sender_card_type: string
  sender_card_country: number
  amount: number
  currency: string
  sender_commission: number
  receiver_commission: number
  agent_commission: number
  amount_debit: number
  amount_credit: number
  commission_debit: number
  commission_credit: number
  currency_debit: string
  currency_credit: string
  sender_bonus: number
  amount_bonus: number
  transaction_id: number
  err_code?: string
  err_description?: string
  create_date: number
  end_date: number
}

// Encode data to base64
function encodeBase64(data: string): string {
  return Buffer.from(data).toString('base64')
}

// Create signature for LiqPay request
function createSignature(data: string): string {
  const signString = LIQPAY_PRIVATE_KEY + data + LIQPAY_PRIVATE_KEY
  return crypto.createHash('sha1').update(signString).digest('base64')
}

// Create payment data and signature
export function createPaymentData(
  orderId: string,
  amount: number,
  description: string,
  customer?: Customer
): { data: string; signature: string } {
  const params: LiqPayParams = {
    version: 3,
    public_key: LIQPAY_PUBLIC_KEY,
    action: 'pay',
    amount: amount,
    currency: 'UAH',
    description: description,
    order_id: orderId,
    result_url: `${APP_URL}/checkout/success?order_id=${orderId}`,
    server_url: `${APP_URL}/api/liqpay/callback`,
    language: 'uk',
    sandbox: process.env.NODE_ENV === 'development' ? 1 : 0,
  }

  if (customer) {
    params.sender_first_name = customer.firstName
    params.sender_last_name = customer.lastName
    params.sender_email = customer.email
    params.sender_phone = customer.phone
  }

  const jsonData = JSON.stringify(params)
  const data = encodeBase64(jsonData)
  const signature = createSignature(data)

  return { data, signature }
}

// Create payment form HTML
export function createPaymentForm(
  orderId: string,
  amount: number,
  description: string,
  customer?: Customer
): string {
  const { data, signature } = createPaymentData(orderId, amount, description, customer)

  return `
    <form method="POST" action="https://www.liqpay.ua/api/3/checkout" accept-charset="utf-8">
      <input type="hidden" name="data" value="${data}" />
      <input type="hidden" name="signature" value="${signature}" />
      <button type="submit" class="btn-primary">
        Оплатити через LiqPay
      </button>
    </form>
  `
}

// Verify callback signature
export function verifyCallback(data: string, signature: string): boolean {
  const expectedSignature = createSignature(data)
  return signature === expectedSignature
}

// Decode callback data
export function decodeCallbackData(data: string): LiqPayCallback {
  const jsonString = Buffer.from(data, 'base64').toString('utf-8')
  return JSON.parse(jsonString)
}

// Check if payment was successful
export function isPaymentSuccessful(callback: LiqPayCallback): boolean {
  const successStatuses = ['success', 'sandbox']
  return successStatuses.includes(callback.status)
}

// Create payment URL (redirect method)
export function createPaymentUrl(
  orderId: string,
  amount: number,
  description: string,
  customer?: Customer
): string {
  const { data, signature } = createPaymentData(orderId, amount, description, customer)
  return `https://www.liqpay.ua/api/3/checkout?data=${encodeURIComponent(data)}&signature=${encodeURIComponent(signature)}`
}

// Generate order ID
export function generateOrderId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `SHTORA-${timestamp}-${random}`.toUpperCase()
}

// Calculate total from cart items
export function calculateTotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.price * item.quantity, 0)
}

// Create order description
export function createOrderDescription(items: CartItem[]): string {
  const itemsText = items
    .map((item) => `${item.name} x${item.quantity}`)
    .join(', ')
  return `Замовлення SHTORA: ${itemsText}`.substring(0, 200)
}
