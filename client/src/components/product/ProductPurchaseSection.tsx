'use client'

import { useState, useCallback } from 'react'
import type { Product } from '@/types'
import { PriceCalculator } from './PriceCalculator'
import { AddToCartButton } from './AddToCartButton'
import { SizeSelector } from './SizeSelector'

interface ProductPurchaseSectionProps {
  product: Product
  sizeVariants?: Array<{ width: number; height: number; price: number; oldPrice?: number; inStock?: boolean }>
}

export function ProductPurchaseSection({ product, sizeVariants = [] }: ProductPurchaseSectionProps) {
  const hasVariants = Array.isArray(sizeVariants) && sizeVariants.length > 0
  // Стан для поточного вибраного варіанту або калькулятора
  const [selectedVariant, setSelectedVariant] = useState<typeof sizeVariants[number] | undefined>(
    hasVariants ? sizeVariants[0] : undefined
  )
  const [calculatedPrice, setCalculatedPrice] = useState<number>(
    hasVariants ? sizeVariants[0].price : product.price
  )
  const [customWidth, setCustomWidth] = useState<number | undefined>(hasVariants ? sizeVariants[0].width : undefined)
  const [customHeight, setCustomHeight] = useState<number | undefined>(hasVariants ? sizeVariants[0].height : undefined)

  // Визначаємо чи показувати калькулятор (тільки якщо немає дискретних варіантів)
  const hasCalculator = !hasVariants && (!!product.pricePerSqm || !!product.fixedHeight || (!!product.width && !!product.height))

  // Callback для оновлення ціни від калькулятора
  const handlePriceChange = useCallback((price: number, width: number, height: number) => {
    setCalculatedPrice(price)
    setCustomWidth(width)
    setCustomHeight(height)
  }, [])

  return (
    <div>
      {/* Єдиний блок ціни: синхронізований як із сіткою розмірів, так і з калькулятором */}
      <div className="mb-6 flex items-baseline gap-3">
        <span className="text-3xl font-bold text-secondary-900">
          {calculatedPrice.toLocaleString('uk-UA')} ₴
        </span>
        {(selectedVariant?.oldPrice ?? product.oldPrice) && (
          <span className="text-xl text-secondary-400 line-through">
            {(selectedVariant?.oldPrice ?? product.oldPrice)!.toLocaleString('uk-UA')} ₴
          </span>
        )}
      </div>

      {/* Сітка готових розмірів із точними цінами */}
      {hasVariants ? (
        <SizeSelector
          variants={sizeVariants}
          selected={selectedVariant}
          onSelect={(v) => {
            setSelectedVariant(v)
            setCalculatedPrice(v.price)
            setCustomWidth(v.width)
            setCustomHeight(v.height)
          }}
        />
      ) : (
        // Калькулятор — fallback, коли дискретних варіантів немає
        hasCalculator && (
          <PriceCalculator
            product={product}
            onPriceChange={handlePriceChange}
          />
        )
      )}

      {/* Кнопка додавання в кошик */}
      <AddToCartButton
        product={product}
        calculatedPrice={calculatedPrice}
        customWidth={customWidth}
        customHeight={customHeight}
      />
    </div>
  )
}
