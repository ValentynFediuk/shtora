'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { useCartStore, useCartHydration } from '@/lib/store/cart'

export default function CartPage() {
  const isHydrated = useCartHydration()
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore()

  const total = getTotal()
  const shipping = total >= 2000 ? 0 : 80
  const grandTotal = total + shipping

  if (!isHydrated) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="py-6 md:py-10">
        <div className="container">
          {/* Breadcrumbs */}
          <nav className="mb-6 flex items-center gap-2 text-sm text-secondary-500">
            <Link href="/" className="hover:text-primary-600">
              Головна
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-secondary-900">Кошик</span>
          </nav>

          <div className="mx-auto max-w-md py-16 text-center">
            <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-secondary-300" />
            <h1 className="mb-2 text-2xl font-bold">Кошик порожній</h1>
            <p className="mb-6 text-secondary-600">
              Додайте товари до кошика, щоб оформити замовлення
            </p>
            <Link href="/catalog" className="btn-primary">
              Перейти до каталогу
            </Link>
          </div>
        </div>
      </div>
    )
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
          <span className="text-secondary-900">Кошик</span>
        </nav>

        <h1 className="mb-8 text-2xl font-bold md:text-3xl">Кошик</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart items */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-secondary-200 bg-white">
              {/* Header */}
              <div className="hidden border-b border-secondary-200 px-6 py-4 md:grid md:grid-cols-12 md:gap-4">
                <div className="col-span-6 text-sm font-medium text-secondary-500">
                  Товар
                </div>
                <div className="col-span-2 text-center text-sm font-medium text-secondary-500">
                  Ціна
                </div>
                <div className="col-span-2 text-center text-sm font-medium text-secondary-500">
                  Кількість
                </div>
                <div className="col-span-2 text-right text-sm font-medium text-secondary-500">
                  Сума
                </div>
              </div>

              {/* Items */}
              <div className="divide-y divide-secondary-200">
                {items.map((item) => (
                  <div
                    key={`${item.id}-${item.size || ''}`}
                    className="grid gap-4 p-4 md:grid-cols-12 md:items-center md:gap-4 md:p-6"
                  >
                    {/* Product */}
                    <div className="flex gap-4 md:col-span-6">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-secondary-100">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <span className="text-2xl opacity-50">🪟</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col justify-center">
                        <Link
                          href={item.slug ? `/product/${item.slug}` : '/catalog'}
                          className="font-medium hover:text-primary-600"
                        >
                          {item.name}
                        </Link>
                        {(item.size || item.color) && (
                          <p className="mt-1 text-sm text-secondary-500">
                            {item.size && <span>Розмір: {item.size}</span>}
                            {item.size && item.color && ' / '}
                            {item.color && <span>Колір: {item.color}</span>}
                          </p>
                        )}
                        <button
                          type="button"
                          onClick={() => removeItem(item.id, item.size)}
                          className="mt-2 flex items-center gap-1 text-sm text-red-500 hover:text-red-600 md:hidden"
                        >
                          <Trash2 className="h-4 w-4" />
                          Видалити
                        </button>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="hidden text-center md:col-span-2 md:block">
                      {item.price.toLocaleString('uk-UA')} ₴
                    </div>

                    {/* Quantity */}
                    <div className="flex items-center justify-between md:col-span-2 md:justify-center">
                      <span className="text-sm text-secondary-500 md:hidden">
                        Кількість:
                      </span>
                      <div className="flex items-center rounded-lg border border-secondary-300">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1, item.size)}
                          className="flex h-8 w-8 items-center justify-center text-secondary-600 hover:bg-secondary-50"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1, item.size)}
                          className="flex h-8 w-8 items-center justify-center text-secondary-600 hover:bg-secondary-50"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="flex items-center justify-between md:col-span-2 md:justify-end">
                      <span className="text-sm text-secondary-500 md:hidden">
                        Сума:
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">
                          {(item.price * item.quantity).toLocaleString('uk-UA')} ₴
                        </span>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id, item.size)}
                          className="hidden p-1 text-secondary-400 hover:text-red-500 md:block"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-secondary-200 px-6 py-4">
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-sm text-secondary-500 hover:text-red-500"
                >
                  Очистити кошик
                </button>
                <Link
                  href="/catalog"
                  className="text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  ← Продовжити покупки
                </Link>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div>
            <div className="sticky top-28 rounded-xl border border-secondary-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-bold">Підсумок замовлення</h2>

              <div className="space-y-3 border-b border-secondary-200 pb-4">
                <div className="flex justify-between text-secondary-600">
                  <span>Товари ({items.length})</span>
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
              </div>

              <div className="flex justify-between py-4 text-lg font-bold">
                <span>Разом</span>
                <span>{grandTotal.toLocaleString('uk-UA')} ₴</span>
              </div>

              {total < 2000 && (
                <p className="mb-4 rounded-lg bg-primary-50 p-3 text-sm text-primary-700">
                  Додайте товарів ще на{' '}
                  <strong>{(2000 - total).toLocaleString('uk-UA')} ₴</strong> для
                  безкоштовної доставки
                </p>
              )}

              <button className="btn-primary w-full py-3 opacity-50" disabled>
                Оформлення замовлень тимчасово недоступне
              </button>

              <div className="mt-4 text-center text-xs text-secondary-500">
                Натискаючи кнопку, ви погоджуєтесь з{' '}
                <Link href="/terms" className="text-primary-600 hover:underline">
                  умовами використання
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
