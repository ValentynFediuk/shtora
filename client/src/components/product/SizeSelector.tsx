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
  // Спочатку пробуємо витягти з назви
  const sizeFromName = extractSizeFromName(product.name)
  if (sizeFromName) {
    return sizeFromName
  }
  
  // Потім з поля sizes
  if (product.sizes && product.sizes.length > 0) {
    return product.sizes[0]
  }
  
  // Потім з width/height
  if (product.width && product.height) {
    return `${product.width}×${product.height}`
  }
  
  return 'Стандарт'
}

export function SizeSelector({ currentProduct, sizeVariants }: SizeSelectorProps) {
  // Якщо немає варіантів - не показуємо селектор
  if (sizeVariants.length === 0) {
    return null
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

  const currentSize = getSizeLabel(currentProduct)

  return (
    <div className="mb-6">
      <label className="mb-3 block text-sm font-medium text-secondary-700">
        Оберіть розмір:
      </label>
      <div className="flex flex-wrap gap-2">
        {sortedVariants.map((variant) => {
          const sizeLabel = getSizeLabel(variant)
          const isCurrentSize = variant.id === currentProduct.id
          
          if (isCurrentSize) {
            // Поточний розмір - кнопка без посилання
            return (
              <button
                key={variant.id}
                type="button"
                disabled
                className="rounded-lg border-2 border-primary-500 bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700 cursor-default"
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
              className="rounded-lg border border-secondary-300 px-4 py-2 text-sm font-medium text-secondary-700 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
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
      <p className="mt-2 text-xs text-secondary-500">
        Ціна залежить від обраного розміру
      </p>
    </div>
  )
}
