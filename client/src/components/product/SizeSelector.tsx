'use client'

import Link from 'next/link'
import type { Product } from '@/types'

interface SizeSelectorProps {
  currentProduct: Product
  sizeVariants: Product[]
}

// Витягує розмір з назви товару (наприклад "100x170" з "... 100*170 см")
function extractSizeFromName(name: string): { width: number; height: number } | null {
  // Шукаємо патерни типу "100*170 см", "100x170", "100х170"
  const match = name.match(/(\d+)\s*[xх×*]\s*(\d+)\s*(см|мм|м)?/i)
  if (match) {
    return { width: parseInt(match[1], 10), height: parseInt(match[2], 10) }
  }
  return null
}

// Витягує ширину та висоту з продукту (в мм для відображення)
function getSizeDimensions(product: Product): { width: number; height: number } | null {
  // Спочатку з width/height (найнадійніше джерело) - конвертуємо см в мм
  if (product.width && product.height) {
    return { width: product.width * 10, height: product.height * 10 }
  }
  
  // Потім пробуємо витягти з назви
  const sizeFromName = extractSizeFromName(product.name)
  if (sizeFromName) {
    // Якщо числа < 30, швидше за все це см, конвертуємо в мм
    // Якщо >= 30, швидше за все вже в мм
    if (sizeFromName.width < 30) {
      return { width: sizeFromName.width * 10, height: sizeFromName.height * 10 }
    }
    return sizeFromName
  }
  
  return null
}

// Форматує розмір у вигляді "200x1700"
function formatSizeLabel(dimensions: { width: number; height: number } | null): string {
  if (!dimensions) return ''
  return `${dimensions.width}x${dimensions.height}`
}

export function SizeSelector({ currentProduct, sizeVariants }: SizeSelectorProps) {
  const currentDimensions = getSizeDimensions(currentProduct)
  const currentSize = formatSizeLabel(currentDimensions)
  
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
      <div className="mb-6">
        <label className="mb-3 block text-sm font-medium text-secondary-700">
          Ширина x Довжина (мм)
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            disabled
            className="rounded-lg border-2 border-primary-500 bg-white px-3 py-2 text-sm font-medium text-primary-600 cursor-default"
          >
            {currentSize}
          </button>
        </div>
      </div>
    )
  }

  // Створюємо масив всіх варіантів включаючи поточний товар
  const allVariants = [currentProduct, ...sizeVariants]
  
  // Сортуємо за шириною (якщо є) або за назвою
  const sortedVariants = allVariants.sort((a, b) => {
    const aDim = getSizeDimensions(a)
    const bDim = getSizeDimensions(b)
    if (aDim && bDim) {
      return aDim.width - bDim.width
    }
    if (a.width && b.width) {
      return a.width - b.width
    }
    return a.name.localeCompare(b.name)
  })

  return (
    <div className="mb-6">
      <label className="mb-3 block text-sm font-medium text-secondary-700">
        Ширина x Довжина (мм)
      </label>
      <div className="grid grid-cols-3 gap-2">
        {sortedVariants.map((variant) => {
          const dimensions = getSizeDimensions(variant)
          const sizeLabel = formatSizeLabel(dimensions) || 'Стандарт'
          const isCurrentSize = variant.id === currentProduct.id
          
          if (isCurrentSize) {
            // Поточний розмір - активна кнопка (з рамкою як на hotto.ua)
            return (
              <button
                key={variant.id}
                type="button"
                disabled
                className="rounded-lg border-2 border-primary-500 bg-white px-3 py-2 text-sm font-medium text-primary-600 cursor-default"
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
              className="rounded-lg border border-secondary-300 bg-white px-3 py-2 text-center text-sm font-medium text-secondary-700 transition-all hover:border-primary-500 hover:text-primary-600"
            >
              {sizeLabel}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
