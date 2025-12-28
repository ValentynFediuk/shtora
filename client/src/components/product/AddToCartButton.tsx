'use client'

import { useState } from 'react'
import { ShoppingCart, Minus, Plus, Check } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'
import type { Product } from '@/types'

interface AddToCartButtonProps {
  product: Product
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1)
  const [isAdded, setIsAdded] = useState(false)
  const addItem = useCartStore((state) => state.addItem)

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta))
  }

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: quantity,
    })

    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2000)
  }

  const isDisabled = !product.inStock

  return (
    <div className="space-y-4">
      {/* Quantity selector */}
      <div className="flex items-center gap-4">
        <span className="text-secondary-600">Кількість:</span>
        <div className="flex items-center rounded-lg border border-secondary-300">
          <button
            type="button"
            onClick={() => handleQuantityChange(-1)}
            disabled={quantity <= 1}
            className="flex h-10 w-10 items-center justify-center text-secondary-600 transition-colors hover:bg-secondary-50 disabled:opacity-50"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-12 text-center font-medium">{quantity}</span>
          <button
            type="button"
            onClick={() => handleQuantityChange(1)}
            className="flex h-10 w-10 items-center justify-center text-secondary-600 transition-colors hover:bg-secondary-50"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Add to cart button */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isDisabled}
          className={`btn flex-1 gap-2 py-3 text-base ${
            isAdded
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'btn-primary'
          } ${isDisabled ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          {isAdded ? (
            <>
              <Check className="h-5 w-5" />
              Додано до кошика
            </>
          ) : (
            <>
              <ShoppingCart className="h-5 w-5" />
              Додати до кошика
            </>
          )}
        </button>
      </div>

      {/* Total price */}
      <div className="rounded-lg bg-primary-50 p-4">
        <div className="flex items-center justify-between">
          <span className="text-secondary-600">Разом:</span>
          <span className="text-2xl font-bold text-primary-600">
            {(product.price * quantity).toLocaleString('uk-UA')} ₴
          </span>
        </div>
        {product.oldPrice && (
          <div className="mt-1 flex items-center justify-between text-sm">
            <span className="text-secondary-500">Економія:</span>
            <span className="font-medium text-green-600">
              {((product.oldPrice - product.price) * quantity).toLocaleString('uk-UA')} ₴
            </span>
          </div>
        )}
      </div>

      {/* Quick buy */}
      <button
        type="button"
        disabled={isDisabled}
        className={`btn-outline w-full py-3 ${isDisabled ? 'cursor-not-allowed opacity-50' : ''}`}
      >
        Купити в 1 клік
      </button>
    </div>
  )
}
