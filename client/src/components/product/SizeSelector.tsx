'use client'

import Link from 'next/link'
import type { Product } from '@/types'

interface SizeSelectorProps {
  currentProduct: Product
  sizeVariants: Product[]
}

// Витягує розмір з назви товару (наприклад "100x170" з "... 100*170 см")
function extractSizeFromName(name: string): string | null {
  // Шукаємо патерни типу "100*170 см", "100x170", "100х170"
  const match = name.match(/(\d+)\s*[xх×*]\s*(\d+)\s*(см|мм|м)?/i)
  if (match) {
    return `${match[1]}×${match[2]}`
  }
  return null
}

// Витягує розмір з поля sizes або width/height
function getSizeLabel(product: Product): string {
  // Спочатку з width/height (найнадійніше джерело)
  if (product.width && product.height) {
    return `${product.width}×${product.height} см`
  }
  
  // Потім пробуємо витягти з назви
  const sizeFromName = extractSizeFromName(product.name)
  if (sizeFromName) {
    return `${sizeFromName} см`
  }
  
  // Потім з поля sizes
  if (product.sizes && product.sizes.length > 0) {
    return product.sizes[0]
  }
  
  return ''
}

export function SizeSelector({ currentProduct, sizeVariants }: SizeSelectorProps) {
  const currentSize = getSizeLabel(currentProduct)
  
  // ЗАВЖДИ показуємо блок з розміром якщо є хоча б один з варіантів:
  // 1. Є currentSize (з width/height, назви, або sizes)
  // 2. Є sizeVariants
  const shouldShow = currentSize !== '' || sizeVariants.length > 0

  // Якщо немає що показувати - не показуємо
  if (!shouldShow) {
    return null
  }

  // Якщо немає варіантів але є розмір - показуємо поточний розмір
  if (sizeVariants.length === 0 && currentSize) {
    return (
      <div className="mb-6 rounded-lg border-2 border-dashed border-primary-300 bg-primary-50/50 p-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-secondary-800">📏 Розмір:</span>
          <span className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-bold text-white shadow-sm">
            {currentSize}
          </span>
        </div>
      </div>
    )
  }

  // Створюємо масив всіх варіантів включаючи поточний товар
  const allVariants = [currentProduct, ...sizeVariants]
  
  // Сортуємо за шириною (якщо є) або за назвою
  const sortedVariants = allVariants.sort((a, b) => {
    if (a.width && b.width) {
      return a.width - b.width
    }
    return a.name.localeCompare(b.name)
  })

  return (
    <div className="mb-6 rounded-lg border-2 border-dashed border-primary-300 bg-primary-50/50 p-4">
      <label className="mb-3 block text-sm font-semibold text-secondary-800">
        📏 Оберіть розмір:
      </label>
      <div className="flex flex-wrap gap-2">
        {sortedVariants.map((variant) => {
          const sizeLabel = getSizeLabel(variant) || 'Стандарт'
          const isCurrentSize = variant.id === currentProduct.id
          
          if (isCurrentSize) {
            // Поточний розмір - активна кнопка
            return (
              <button
                key={variant.id}
                type="button"
                disabled
                className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-bold text-white shadow-sm cursor-default"
              >
                {sizeLabel}
              </button>
            )
          }
          
          // Інші розміри - посилання на сторінку товару
          return (
            <Link
              key={variant.id}
              href={`/product/${variant.slug}`}
              className="rounded-lg border-2 border-secondary-300 bg-white px-4 py-2 text-sm font-medium text-secondary-700 transition-all hover:border-primary-500 hover:bg-primary-100 hover:text-primary-700 hover:shadow-sm"
            >
              {sizeLabel}
              {variant.price !== currentProduct.price && (
                <span className="ml-1 text-xs text-secondary-500">
                  ({variant.price.toLocaleString('uk-UA')} ₴)
                </span>
              )}
            </Link>
          )
        })}
      </div>
      <p className="mt-3 text-xs text-secondary-600">
        💡 Ціна залежить від обраного розміру
      </p>
    </div>
  )
}
