'use client'

import Image from 'next/image'
import { Heart, ShoppingCart, Eye } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'
import type { Product } from '@/types'
import { useRouter } from 'next/navigation'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter()
  const addItem = useCartStore((state) => state.addItem)

  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : null

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    })
  }

  return (
    <div
      role="link"
      tabIndex={0}
      className="group card overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg cursor-pointer"
      onClick={() => {
        if (product.slug) router.push(`/product/${product.slug}`)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && product.slug) router.push(`/product/${product.slug}`)
      }}
    >
      {/* Image container */}
      <div className="relative aspect-square overflow-hidden bg-secondary-100">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-6xl opacity-50">🪟</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {discount && (
            <span className="badge bg-red-500 text-white">-{discount}%</span>
          )}
          {product.isNew && (
            <span className="badge bg-green-500 text-white">Новинка</span>
          )}
          {product.isHit && (
            <span className="badge bg-primary-500 text-white">Хіт</span>
          )}
        </div>

        {/* Quick actions */}
        <div className="absolute right-2 top-2 flex flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md transition-colors hover:bg-primary-50"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              // Add to wishlist logic
            }}
          >
            <Heart className="h-4 w-4 text-secondary-600" />
          </button>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md transition-colors hover:bg-primary-50"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              // Quick view logic
            }}
          >
            <Eye className="h-4 w-4 text-secondary-600" />
          </button>
        </div>

        {/* Add to cart button */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full bg-gradient-to-t from-black/60 to-transparent p-4 transition-transform group-hover:translate-y-0">
          <button
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-white py-2 text-sm font-medium text-secondary-900 transition-colors hover:bg-primary-500 hover:text-white"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4" />
            До кошика
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category */}
        {product.category && (
          <p className="mb-1 text-xs text-secondary-500">{product.category}</p>
        )}

        {/* Name */}
        <h3 className="mb-2 line-clamp-2 font-medium text-secondary-900 transition-colors group-hover:text-primary-600">
          {product.name}
        </h3>

        {/* Rating */}
        {product.rating && (
          <div className="mb-2 flex items-center gap-1">
            <span className="text-sm text-yellow-500">★</span>
            <span className="text-sm text-secondary-600">{product.rating}</span>
            {product.reviewsCount && (
              <span className="text-xs text-secondary-400">
                ({product.reviewsCount})
              </span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-secondary-900">
            {product.price.toLocaleString('uk-UA')} ₴
          </span>
          {product.oldPrice && (
            <span className="text-sm text-secondary-400 line-through">
              {product.oldPrice.toLocaleString('uk-UA')} ₴
            </span>
          )}
        </div>

        {/* Sizes */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {product.sizes.map((size) => (
              <span
                key={size}
                className="rounded border border-secondary-200 bg-secondary-50 px-2 py-0.5 text-xs text-secondary-600"
              >
                {size}
              </span>
            ))}
          </div>
        )}

        {/* Availability */}
        {product.inStock !== undefined && (
          <p
            className={`mt-2 text-xs ${
              product.inStock ? 'text-green-600' : 'text-red-500'
            }`}
          >
            {product.inStock ? '✓ В наявності' : '✗ Немає в наявності'}
          </p>
        )}
      </div>
    </div>
  )
}
