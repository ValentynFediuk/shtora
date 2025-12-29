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

// Витягує ширину та висоту з продукту (в см)
function getSizeDimensions(product: Product): { width: number; height: number } | null {
  // Спочатку з width/height (найнадійніше джерело)
  if (product.width && product.height) {
    return { width: product.width, height: product.height }
  }
  
  // Потім пробуємо витягти з назви
  const sizeFromName = extractSizeFromName(product.name)
  if (sizeFromName) {
    return sizeFromName
  }
  
  return null
}

interface SizeOption {
  width: number
  height: number
  slug?: string
  id?: string
  price?: number
  isFromDB: boolean
}

export function SizeSelector({ currentProduct, sizeVariants }: SizeSelectorProps) {
  const currentDimensions = getSizeDimensions(currentProduct)
  
  // Визначаємо чи є варіанти товару в базі
  const hasVariantsFromDB = sizeVariants.length > 0
  
  // Якщо немає варіантів з бази - не показуємо селектор
  if (!hasVariantsFromDB && !currentDimensions) {
    return null
  }
  
  // Збираємо всі розміри з цінами
  let allSizes: SizeOption[] = []
  
  // Додаємо поточний товар
  if (currentDimensions) {
    allSizes.push({
      ...currentDimensions,
      slug: currentProduct.slug,
      id: currentProduct.id,
      price: currentProduct.price,
      isFromDB: true
    })
  }
  
  // Додаємо варіанти з бази
  sizeVariants.forEach(variant => {
    const dims = getSizeDimensions(variant)
    if (dims) {
      // Перевіряємо чи вже є такий розмір
      const exists = allSizes.some(s => s.width === dims.width && s.height === dims.height)
      if (!exists) {
        allSizes.push({
          ...dims,
          slug: variant.slug,
          id: variant.id,
          price: variant.price,
          isFromDB: true
        })
      }
    }
  })
  
  // Якщо немає що показувати - не показуємо
  if (allSizes.length <= 1) {
    return null
  }
  
  // Сортуємо за шириною
  allSizes.sort((a, b) => a.width - b.width)
  
  // Визначаємо поточний вибраний розмір
  const selectedWidth = currentDimensions?.width

  // Форматування ціни
  const formatPrice = (price?: number) => {
    if (!price) return ''
    return price.toLocaleString('uk-UA')
  }

  return (
    <div className="mb-6">
      <label className="mb-3 block text-sm font-bold text-secondary-900">
        Оберіть розмір (ширина × висота, см)
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {allSizes.map((size, index) => {
          const sizeLabel = `${size.width}×${size.height}`
          const isSelected = size.width === selectedWidth && size.height === currentDimensions?.height
          
          if (isSelected) {
            // Вибраний розмір - активна кнопка з помаранчевою рамкою
            return (
              <div
                key={size.id || `size-${index}`}
                className="rounded-lg border-2 border-orange-500 bg-orange-50 px-3 py-2.5 text-center cursor-default"
              >
                <div className="text-sm font-semibold text-orange-600">
                  {sizeLabel}
                </div>
                {size.price && (
                  <div className="text-xs font-bold text-orange-700 mt-0.5">
                    {formatPrice(size.price)} ₴
                  </div>
                )}
              </div>
            )
          }
          
          // Якщо розмір з бази - робимо посилання
          if (size.isFromDB && size.slug) {
            return (
              <Link
                key={size.id || `size-${index}`}
                href={`/product/${size.slug}`}
                className="rounded-lg border border-secondary-200 bg-white px-3 py-2.5 text-center transition-all hover:border-orange-400 hover:bg-orange-50 group"
              >
                <div className="text-sm font-medium text-secondary-700 group-hover:text-orange-600">
                  {sizeLabel}
                </div>
                {size.price && (
                  <div className="text-xs font-semibold text-secondary-500 group-hover:text-orange-600 mt-0.5">
                    {formatPrice(size.price)} ₴
                  </div>
                )}
              </Link>
            )
          }
          
          // Якщо розмір без slug - неактивна кнопка
          return (
            <div
              key={`size-${index}`}
              className="rounded-lg border border-secondary-200 bg-secondary-50 px-3 py-2.5 text-center opacity-50 cursor-not-allowed"
            >
              <div className="text-sm font-medium text-secondary-400">
                {sizeLabel}
              </div>
              {size.price && (
                <div className="text-xs text-secondary-400 mt-0.5">
                  {formatPrice(size.price)} ₴
                </div>
              )}
            </div>
          )
        })}
      </div>
      <p className="mt-2 text-xs text-secondary-500">
        Натисніть на потрібний розмір для перегляду ціни
      </p>
    </div>
  )
}
