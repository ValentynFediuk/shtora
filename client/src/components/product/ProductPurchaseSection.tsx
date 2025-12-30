'use client'

import { useState, useCallback } from 'react'
import type { Product } from '@/types'
import { PriceCalculator } from './PriceCalculator'
import { AddToCartButton } from './AddToCartButton'

interface ProductPurchaseSectionProps {
  product: Product
}

export function ProductPurchaseSection({ product }: ProductPurchaseSectionProps) {
  // Стан для калькулятора
  const [calculatedPrice, setCalculatedPrice] = useState(product.price)
  const [customWidth, setCustomWidth] = useState<number | undefined>(undefined)
  const [customHeight, setCustomHeight] = useState<number | undefined>(undefined)

  // Визначаємо чи потрібен калькулятор для цього товару
  // Показуємо калькулятор якщо є спеціальні поля АБО якщо є базові розміри (fallback)
  const hasCalculator = !!product.pricePerSqm || !!product.fixedHeight || (!!product.width && !!product.height)

  // Callback для оновлення ціни від калькулятора
  const handlePriceChange = useCallback((price: number, width: number, height: number) => {
    setCalculatedPrice(price)
    setCustomWidth(width)
    setCustomHeight(height)
  }, [])

  return (
    <div>
      {/* Калькулятор - показуємо тільки якщо товар підтримує калькулятор */}
      {hasCalculator && (
        <PriceCalculator 
          product={product} 
          onPriceChange={handlePriceChange} 
        />
      )}

      {/* Кнопка додавання в кошик */}
      <AddToCartButton
        product={product}
        calculatedPrice={hasCalculator ? calculatedPrice : undefined}
        customWidth={hasCalculator ? customWidth : undefined}
        customHeight={hasCalculator ? customHeight : undefined}
      />
    </div>
  )
}
