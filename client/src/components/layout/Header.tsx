'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Search, ShoppingBag, User, Heart } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'

const navigation = [
  { name: 'Каталог', href: '/catalog' },
  { name: 'Штори', href: '/catalog/shtory' },
  { name: 'Тюль', href: '/catalog/tiul' },
  { name: 'Карнизи', href: '/catalog/karnyzy' },
  { name: 'Текстиль', href: '/catalog/tekstyl' },
  { name: 'Акції', href: '/sales' },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const cartItems = useCartStore((state) => state.items)
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0)

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Top bar */}
      <div className="bg-secondary-900 text-white">
        <div className="container flex h-10 items-center justify-between text-xs">
          <div className="hidden md:flex md:items-center md:gap-4">
            <span>📞 0 800 123 456 (безкоштовно)</span>
            <span>📍 Київ, вул. Хрещатик, 1</span>
          </div>
          <div className="flex items-center gap-4">
            <span>🚚 Безкоштовна доставка від 2000 ₴</span>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container">
        <div className="flex h-16 items-center justify-between gap-4 md:h-20">
          {/* Mobile menu button */}
          <button
            type="button"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-primary-600">SHTORA</span>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden lg:flex lg:gap-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-secondary-700 transition-colors hover:text-primary-600"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Search bar - desktop */}
          <div className="hidden flex-1 max-w-md lg:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Пошук товарів..."
                className="input pr-10"
              />
              <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-secondary-400" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Search button - mobile */}
            <button
              type="button"
              className="p-2 lg:hidden"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Wishlist */}
            <Link href="/wishlist" className="hidden p-2 md:block">
              <Heart className="h-5 w-5" />
            </Link>

            {/* Account */}
            <Link href="/account" className="hidden p-2 md:block">
              <User className="h-5 w-5" />
            </Link>

            {/* Cart */}
            <Link href="/cart" className="relative p-2">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-xs font-medium text-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile search */}
        {searchOpen && (
          <div className="border-t py-3 lg:hidden">
            <div className="relative">
              <input
                type="text"
                placeholder="Пошук товарів..."
                className="input pr-10"
                autoFocus
              />
              <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-secondary-400" />
            </div>
          </div>
        )}
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-xl font-bold text-primary-600">SHTORA</span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex flex-col gap-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-lg font-medium text-secondary-700 hover:text-primary-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className="mt-8 border-t pt-6">
              <Link
                href="/account"
                className="flex items-center gap-2 text-secondary-700"
              >
                <User className="h-5 w-5" />
                <span>Мій кабінет</span>
              </Link>
              <Link
                href="/wishlist"
                className="mt-4 flex items-center gap-2 text-secondary-700"
              >
                <Heart className="h-5 w-5" />
                <span>Список бажань</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
