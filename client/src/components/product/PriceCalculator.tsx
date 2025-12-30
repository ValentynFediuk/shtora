'use client'

import { useState, useEffect, useCallback } from 'react'
import { Calculator, Info } from 'lucide-react'
import type { Product } from '@/types'

interface PriceCalculatorProps {
  product: Product
  onPriceChange: (price: number, width: number, height: number) => void
}

// Функція розрахунку ціни
function calculatePrice(
  width: number,
  height: number,
  pricePerSqm: number,
  basePrice: number
): number {
  // Конвертуємо см в метри та рахуємо площу
  const widthM = width / 100
  const heightM = height / 100
  const area = widthM * heightM
  
  // Ціна = площа × ціна за кв.м
  // Мінімальна ціна — базова ціна товару
  const calculatedPrice = Math.max(area * pricePerSqm, basePrice)
  
  // Округлюємо до цілих гривень
  return Math.round(calculatedPrice)
}

export function PriceCalculator({ product, onPriceChange }: PriceCalculatorProps) {
  // Дефолтні значення - використовуємо наявні розміри продукту як fallback
  const defaultWidth = product.minWidth ?? product.width ?? 100
  const defaultHeight = product.fixedHeight ?? product.minHeight ?? product.height ?? 170
  
  const [width, setWidth] = useState(defaultWidth)
  const [height, setHeight] = useState(defaultHeight)
  const [calculatedPrice, setCalculatedPrice] = useState(product.price)
  
  // Визначаємо чи висота фіксована (для римських штор)
  const isHeightFixed = !!product.fixedHeight
  
  // Межі розмірів - якщо діапазонів немає, використовуємо наявні width/height
  const minWidth = product.minWidth ?? product.width ?? 30
  const maxWidth = product.maxWidth ?? product.width ?? 300
  const minHeight = product.minHeight ?? product.height ?? 50
  const maxHeight = product.maxHeight ?? product.height ?? 300
  
  // Ціна за кв.м - розраховуємо з фактичних розмірів продукту якщо не вказана
  // Типобезпечний розрахунок без доступу до можливих undefined
  const refWidth = typeof product.width === 'number' ? product.width : defaultWidth
  const refHeight = typeof product.fixedHeight === 'number'
    ? product.fixedHeight
    : (typeof product.height === 'number' ? product.height : defaultHeight)
  const pricePerSqm = product.pricePerSqm ?? (
    product.price / ((refWidth / 100) * (refHeight / 100))
  )

  // Розрахунок ціни при зміні розмірів
  const recalculatePrice = useCallback(() => {
    const effectiveHeight = isHeightFixed ? product.fixedHeight! : height
    const newPrice = calculatePrice(width, effectiveHeight, pricePerSqm, product.price)
    setCalculatedPrice(newPrice)
    onPriceChange(newPrice, width, effectiveHeight)
  }, [width, height, pricePerSqm, product.price, product.fixedHeight, isHeightFixed, onPriceChange])

  // Перерахунок при зміні розмірів
  useEffect(() => {
    recalculatePrice()
  }, [recalculatePrice])

  // Валідація вводу ширини
  const handleWidthChange = (value: string) => {
    const numValue = parseInt(value, 10)
    if (!isNaN(numValue)) {
      const clampedValue = Math.min(Math.max(numValue, minWidth), maxWidth)
      setWidth(clampedValue)
    }
  }

  // Валідація вводу висоти
  const handleHeightChange = (value: string) => {
    if (isHeightFixed) return
    const numValue = parseInt(value, 10)
    if (!isNaN(numValue)) {
      const clampedValue = Math.min(Math.max(numValue, minHeight), maxHeight)
      setHeight(clampedValue)
    }
  }

  // Швидкі кнопки для популярних ширин
  const quickWidths = [80, 100, 120, 140, 160, 180, 200]
  const availableQuickWidths = quickWidths.filter(w => w >= minWidth && w <= maxWidth)

  return (
    <div className="mb-6 rounded-xl border-2 border-primary-200 bg-gradient-to-br from-primary-50 to-white p-5">
      <div className="mb-4 flex items-center gap-2">
        <Calculator className="h-5 w-5 text-primary-600" />
        <h3 className="text-lg font-semibold text-secondary-800">
          Калькулятор розміру та ціни
        </h3>
      </div>

      <div className="space-y-4">
        {/* Ширина */}
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-secondary-700">
            Ширина (см)
            <span className="text-xs text-secondary-400">
              від {minWidth} до {maxWidth} см
            </span>
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={width}
              onChange={(e) => handleWidthChange(e.target.value)}
              min={minWidth}
              max={maxWidth}
              className="w-24 rounded-lg border-2 border-secondary-200 px-3 py-2 text-center text-lg font-semibold focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
            />
            <input
              type="range"
              value={width}
              onChange={(e) => setWidth(parseInt(e.target.value, 10))}
              min={minWidth}
              max={maxWidth}
              step={1}
              className="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-secondary-200 accent-primary-500"
            />
          </div>
          {/* Швидкі кнопки ширини */}
          {availableQuickWidths.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {availableQuickWidths.map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setWidth(w)}
                  className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                    width === w
                      ? 'bg-primary-500 text-white'
                      : 'bg-secondary-100 text-secondary-600 hover:bg-primary-100 hover:text-primary-700'
                  }`}
                >
                  {w} см
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Висота */}
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-secondary-700">
            Висота (см)
            {isHeightFixed ? (
              <span className="flex items-center gap-1 rounded-full bg-primary-100 px-2 py-0.5 text-xs text-primary-700">
                <Info className="h-3 w-3" />
                Фіксована
              </span>
            ) : (
              <span className="text-xs text-secondary-400">
                від {minHeight} до {maxHeight} см
              </span>
            )}
          </label>
          {isHeightFixed ? (
            <div className="flex items-center gap-2">
              <div className="w-24 rounded-lg border-2 border-secondary-200 bg-secondary-50 px-3 py-2 text-center text-lg font-semibold text-secondary-600">
                {product.fixedHeight}
              </div>
              <span className="text-sm text-secondary-500">
                Стандартна висота для цього типу товару
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={height}
                onChange={(e) => handleHeightChange(e.target.value)}
                min={minHeight}
                max={maxHeight}
                className="w-24 rounded-lg border-2 border-secondary-200 px-3 py-2 text-center text-lg font-semibold focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
              />
              <input
                type="range"
                value={height}
                onChange={(e) => setHeight(parseInt(e.target.value, 10))}
                min={minHeight}
                max={maxHeight}
                step={1}
                className="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-secondary-200 accent-primary-500"
              />
            </div>
          )}
        </div>

        {/* Результат */}
        <div className="rounded-lg bg-primary-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-600">Ваш розмір:</p>
              <p className="text-lg font-bold text-secondary-800">
                {width} × {isHeightFixed ? product.fixedHeight : height} см
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-secondary-600">Ціна:</p>
              <p className="text-2xl font-bold text-primary-600">
                {calculatedPrice.toLocaleString('uk-UA')} ₴
              </p>
            </div>
          </div>
          {pricePerSqm && (
            <p className="mt-2 text-xs text-secondary-500">
              * Ціна розрахована: {pricePerSqm.toLocaleString('uk-UA')} ₴/м²
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
