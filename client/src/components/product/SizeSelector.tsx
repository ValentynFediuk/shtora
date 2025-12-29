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

// Генерує стандартну сітку розмірів (як на hotto.ua)
function generateSizeGrid(fixedHeight: number = 1700): { width: number; height: number }[] {
  const standardWidths = [
    200, 400, 425, 450, 475, 500, 525, 550, 575, 600, 625, 650, 675, 700, 750,
    825, 975, 1200, 1300, 1500, 1600, 1700, 1800, 1900, 2000
  ]
  return standardWidths.map(w => ({ width: w, height: fixedHeight }))
}

export function SizeSelector({ currentProduct, sizeVariants }: SizeSelectorProps) {
  const currentDimensions = getSizeDimensions(currentProduct)
  const currentSize = formatSizeLabel(currentDimensions)
  
  // Визначаємо чи є варіанти товару в базі
  const hasVariantsFromDB = sizeVariants.length > 0
  
  // Визначаємо фіксовану висоту (1700 мм за замовчуванням)
  const fixedHeight = currentDimensions?.height || 1700
  
  // Якщо є варіанти з бази - використовуємо їх
  // Якщо немає - генеруємо стандартну сітку розмірів
  let allSizes: { width: number; height: number; slug?: string; id?: string; isFromDB: boolean }[] = []
  
  if (hasVariantsFromDB) {
    // Додаємо поточний товар
    if (currentDimensions) {
      allSizes.push({
        ...currentDimensions,
        slug: currentProduct.slug,
        id: currentProduct.id,
        isFromDB: true
      })
    }
    // Додаємо варіанти з бази
    sizeVariants.forEach(variant => {
      const dims = getSizeDimensions(variant)
      if (dims) {
        allSizes.push({
          ...dims,
          slug: variant.slug,
          id: variant.id,
          isFromDB: true
        })
      }
    })
  } else {
    // Генеруємо стандартну сітку
    const standardSizes = generateSizeGrid(fixedHeight)
    allSizes = standardSizes.map(size => ({
      ...size,
      isFromDB: false
    }))
  }
  
  // Якщо немає що показувати - не показуємо
  if (allSizes.length === 0) {
    return null
  }
  
  // Сортуємо за шириною
  allSizes.sort((a, b) => a.width - b.width)
  
  // Визначаємо поточний вибраний розмір
  const selectedWidth = currentDimensions?.width

  return (
    <div className="mb-6">
      <label className="mb-3 block text-sm font-bold text-secondary-900">
        Ширина x Довжина (мм)
      </label>
      <div className="grid grid-cols-3 gap-2">
        {allSizes.map((size, index) => {
          const sizeLabel = `${size.width}x${size.height}`
          const isSelected = size.width === selectedWidth
          
          if (isSelected) {
            // Вибраний розмір - активна кнопка з помаранчевою рамкою (як на hotto.ua)
            return (
              <button
                key={size.id || `size-${index}`}
                type="button"
                disabled
                className="rounded-lg border-2 border-orange-500 bg-white px-3 py-2.5 text-sm font-medium text-orange-500 cursor-default"
              >
                {sizeLabel}
              </button>
            )
          }
          
          // Якщо розмір з бази - робимо посилання
          if (size.isFromDB && size.slug) {
            return (
              <Link
                key={size.id || `size-${index}`}
                href={`/product/${size.slug}`}
                className="rounded-lg border border-secondary-300 bg-white px-3 py-2.5 text-center text-sm font-medium text-secondary-600 transition-all hover:border-orange-500 hover:text-orange-500"
              >
                {sizeLabel}
              </Link>
            )
          }
          
          // Якщо розмір згенерований - просто кнопка (неактивна поки немає в базі)
          return (
            <button
              key={`size-${index}`}
              type="button"
              className="rounded-lg border border-secondary-300 bg-white px-3 py-2.5 text-center text-sm font-medium text-secondary-600 transition-all hover:border-orange-500 hover:text-orange-500 cursor-pointer"
            >
              {sizeLabel}
            </button>
          )
        })}
      </div>
    </div>
  )
}
