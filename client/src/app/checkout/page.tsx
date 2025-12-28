'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ChevronRight, CreditCard, Truck, MapPin, Check } from 'lucide-react'
import { useCartStore, useCartHydration } from '@/lib/store/cart'

type PaymentMethod = 'card' | 'liqpay' | 'cash'
type DeliveryMethod = 'nova_poshta' | 'ukrposhta' | 'pickup'

export default function CheckoutPage() {
  const router = useRouter()
  const isHydrated = useCartHydration()
  const { items, getTotal, clearCart } = useCartStore()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card')
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('nova_poshta')

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    city: '',
    warehouse: '',
    comment: '',
  })

  const total = getTotal()
  const shipping = total >= 2000 ? 0 : 80
  const grandTotal = total + shipping

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Here you would:
      // 1. Create order in Directus
      // 2. If card/liqpay - redirect to payment
      // 3. If cash - show success page

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Clear cart and redirect to success
      clearCart()
      router.push('/checkout/success?order=SHTORA-12345')
    } catch (error) {
      console.error('Checkout error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isHydrated) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  if (items.length === 0) {
    router.push('/cart')
    return null
  }

  return (
    <div className="py-6 md:py-10">
      <div className="container">
        {/* Breadcrumbs */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-secondary-500">
          <Link href="/" className="hover:text-primary-600">
            Головна
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/cart" className="hover:text-primary-600">
            Кошик
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-secondary-900">Оформлення замовлення</span>
        </nav>

        <h1 className="mb-8 text-2xl font-bold md:text-3xl">Оформлення замовлення</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Form */}
            <div className="space-y-6 lg:col-span-2">
              {/* Contact info */}
              <div className="rounded-xl border border-secondary-200 bg-white p-6">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-500 text-sm text-white">
                    1
                  </span>
                  Контактні дані
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Ім&apos;я *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="input"
                      placeholder="Іван"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Прізвище *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="input"
                      placeholder="Петренко"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Телефон *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="input"
                      placeholder="+380 XX XXX XX XX"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery */}
              <div className="rounded-xl border border-secondary-200 bg-white p-6">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-500 text-sm text-white">
                    2
                  </span>
                  Доставка
                </h2>

                {/* Delivery method */}
                <div className="mb-4 grid gap-3 sm:grid-cols-3">
                  {[
                    { id: 'nova_poshta', name: 'Нова Пошта', icon: Truck },
                    { id: 'ukrposhta', name: 'Укрпошта', icon: MapPin },
                    { id: 'pickup', name: 'Самовивіз', icon: MapPin },
                  ].map((method) => (
                    <label
                      key={method.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3 transition-colors ${
                        deliveryMethod === method.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-secondary-200 hover:border-secondary-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="deliveryMethod"
                        value={method.id}
                        checked={deliveryMethod === method.id}
                        onChange={(e) =>
                          setDeliveryMethod(e.target.value as DeliveryMethod)
                        }
                        className="sr-only"
                      />
                      <method.icon className="h-5 w-5 text-primary-600" />
                      <span className="text-sm font-medium">{method.name}</span>
                      {deliveryMethod === method.id && (
                        <Check className="ml-auto h-4 w-4 text-primary-600" />
                      )}
                    </label>
                  ))}
                </div>

                {/* Address fields */}
                {deliveryMethod !== 'pickup' && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Місто *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className="input"
                        placeholder="Почніть вводити назву міста"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Відділення / Поштомат *
                      </label>
                      <input
                        type="text"
                        name="warehouse"
                        value={formData.warehouse}
                        onChange={handleInputChange}
                        required
                        className="input"
                        placeholder="Оберіть відділення"
                      />
                    </div>
                  </div>
                )}

                {deliveryMethod === 'pickup' && (
                  <div className="rounded-lg bg-secondary-50 p-4">
                    <p className="font-medium">Адреса самовивозу:</p>
                    <p className="text-secondary-600">
                      м. Київ, вул. Хрещатик, 1
                    </p>
                    <p className="mt-2 text-sm text-secondary-500">
                      Пн-Пт: 9:00 - 18:00, Сб: 10:00 - 15:00
                    </p>
                  </div>
                )}
              </div>

              {/* Payment */}
              <div className="rounded-xl border border-secondary-200 bg-white p-6">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-500 text-sm text-white">
                    3
                  </span>
                  Оплата
                </h2>

                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { id: 'card', name: 'Карткою онлайн', desc: 'Visa / MasterCard' },
                    { id: 'liqpay', name: 'LiqPay', desc: 'Швидка оплата' },
                    { id: 'cash', name: 'При отриманні', desc: 'Накладений платіж' },
                  ].map((method) => (
                    <label
                      key={method.id}
                      className={`flex cursor-pointer flex-col rounded-lg border-2 p-3 transition-colors ${
                        paymentMethod === method.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-secondary-200 hover:border-secondary-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={(e) =>
                          setPaymentMethod(e.target.value as PaymentMethod)
                        }
                        className="sr-only"
                      />
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{method.name}</span>
                        {paymentMethod === method.id && (
                          <Check className="h-4 w-4 text-primary-600" />
                        )}
                      </div>
                      <span className="text-xs text-secondary-500">
                        {method.desc}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div className="rounded-xl border border-secondary-200 bg-white p-6">
                <h2 className="mb-4 text-lg font-bold">Коментар до замовлення</h2>
                <textarea
                  name="comment"
                  value={formData.comment}
                  onChange={handleInputChange}
                  rows={3}
                  className="input resize-none"
                  placeholder="Додаткові побажання до замовлення..."
                />
              </div>
            </div>

            {/* Summary */}
            <div>
              <div className="sticky top-28 rounded-xl border border-secondary-200 bg-white p-6">
                <h2 className="mb-4 text-lg font-bold">Ваше замовлення</h2>

                {/* Items */}
                <div className="mb-4 max-h-64 space-y-3 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-secondary-100">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-lg">
                            🪟
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium line-clamp-1">
                          {item.name}
                        </p>
                        <p className="text-xs text-secondary-500">
                          {item.quantity} × {item.price.toLocaleString('uk-UA')} ₴
                        </p>
                      </div>
                      <p className="text-sm font-medium">
                        {(item.price * item.quantity).toLocaleString('uk-UA')} ₴
                      </p>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-2 border-t border-secondary-200 pt-4">
                  <div className="flex justify-between text-secondary-600">
                    <span>Товари</span>
                    <span>{total.toLocaleString('uk-UA')} ₴</span>
                  </div>
                  <div className="flex justify-between text-secondary-600">
                    <span>Доставка</span>
                    {shipping === 0 ? (
                      <span className="text-green-600">Безкоштовно</span>
                    ) : (
                      <span>{shipping} ₴</span>
                    )}
                  </div>
                  <div className="flex justify-between pt-2 text-lg font-bold">
                    <span>Разом</span>
                    <span>{grandTotal.toLocaleString('uk-UA')} ₴</span>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary mt-6 w-full py-3 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Обробка...
                    </span>
                  ) : (
                    'Підтвердити замовлення'
                  )}
                </button>

                <p className="mt-4 text-center text-xs text-secondary-500">
                  Натискаючи кнопку, ви погоджуєтесь з{' '}
                  <Link href="/terms" className="text-primary-600 hover:underline">
                    умовами використання
                  </Link>{' '}
                  та{' '}
                  <Link href="/privacy" className="text-primary-600 hover:underline">
                    політикою конфіденційності
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
