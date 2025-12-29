'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import type { Category, ProductFilter } from '@/types'

interface CatalogFiltersProps {
  categories: Category[]
  currentFilter: ProductFilter
  availableSizes?: string[]
}

export function CatalogFilters({ categories, currentFilter, availableSizes = [] }: CatalogFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [minPrice, setMinPrice] = useState(currentFilter.minPrice?.toString() || '')
  const [maxPrice, setMaxPrice] = useState(currentFilter.maxPrice?.toString() || '')

  const selectedSizes = currentFilter.sizes || []

  const toggleSize = (size: string) => {
    const params = new URLSearchParams(searchParams.toString())
    const currentSizes = params.get('sizes')?.split(',').filter(Boolean) || []
    
    let newSizes: string[]
    if (currentSizes.includes(size)) {
      newSizes = currentSizes.filter((s) => s !== size)
    } else {
      newSizes = [...currentSizes, size]
    }

    if (newSizes.length > 0) {
      params.set('sizes', newSizes.join(','))
    } else {
      params.delete('sizes')
    }

    params.delete('page')
    router.push(`/catalog?${params.toString()}`)
  }

  const updateFilter = (key: string, value: string | boolean | null) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value === null || value === '' || value === false) {
      params.delete(key)
    } else {
      params.set(key, String(value))
    }

    // Reset page when filter changes
    params.delete('page')
    
    router.push(`/catalog?${params.toString()}`)
  }

  const applyPriceFilter = () => {
    const params = new URLSearchParams(searchParams.toString())

    if (minPrice) {
      params.set('minPrice', minPrice)
    } else {
      params.delete('minPrice')
    }

    if (maxPrice) {
      params.set('maxPrice', maxPrice)
    } else {
      params.delete('maxPrice')
    }

    params.delete('page')
    router.push(`/catalog?${params.toString()}`)
  }

  const clearAllFilters = () => {
    router.push('/catalog')
  }

  const hasActiveFilters = 
    currentFilter.category ||
    currentFilter.minPrice ||
    currentFilter.maxPrice ||
    currentFilter.inStock ||
    currentFilter.isNew ||
    currentFilter.isHit ||
    (currentFilter.sizes && currentFilter.sizes.length > 0)

  return (
    <div className="space-y-6">
      {/* Clear filters */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearAllFilters}
          className="text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          ✕ Скинути всі фільтри
        </button>
      )}

      {/* Categories */}
      <div>
        <h3 className="mb-3 font-semibold">Категорії</h3>
        <ul className="space-y-2">
          <li>
            <button
              type="button"
              onClick={() => updateFilter('category', null)}
              className={`text-sm transition-colors ${
                !currentFilter.category
                  ? 'font-medium text-primary-600'
                  : 'text-secondary-600 hover:text-secondary-900'
              }`}
            >
              Всі категорії
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.slug}>
              <button
                type="button"
                onClick={() => updateFilter('category', cat.slug)}
                className={`text-sm transition-colors ${
                  currentFilter.category === cat.slug
                    ? 'font-medium text-primary-600'
                    : 'text-secondary-600 hover:text-secondary-900'
                }`}
              >
                {cat.name}
                {cat.productsCount && (
                  <span className="ml-1 text-secondary-400">
                    ({cat.productsCount})
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Price range */}
      <div>
        <h3 className="mb-3 font-semibold">Ціна, ₴</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="від"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="input w-full py-1.5 text-sm"
          />
          <span className="text-secondary-400">–</span>
          <input
            type="number"
            placeholder="до"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="input w-full py-1.5 text-sm"
          />
        </div>
        <button
          type="button"
          onClick={applyPriceFilter}
          className="btn-secondary mt-2 w-full py-1.5 text-sm"
        >
          Застосувати
        </button>
      </div>

      {/* Sizes */}
      {availableSizes.length > 0 && (
        <div>
          <h3 className="mb-3 font-semibold">Розміри</h3>
          <div className="flex flex-wrap gap-2">
            {availableSizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => toggleSize(size)}
                className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                  selectedSizes.includes(size)
                    ? 'border-primary-500 bg-primary-50 font-medium text-primary-700'
                    : 'border-secondary-300 text-secondary-600 hover:border-primary-300 hover:bg-primary-50'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Availability */}
      <div>
        <h3 className="mb-3 font-semibold">Наявність</h3>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={currentFilter.inStock === true}
            onChange={(e) => updateFilter('inStock', e.target.checked ? true : null)}
            className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-secondary-700">Тільки в наявності</span>
        </label>
      </div>

      {/* Special offers */}
      <div>
        <h3 className="mb-3 font-semibold">Спеціальні пропозиції</h3>
        <div className="space-y-2">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={currentFilter.isNew === true}
              onChange={(e) => updateFilter('isNew', e.target.checked ? true : null)}
              className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-secondary-700">Новинки</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={currentFilter.isHit === true}
              onChange={(e) => updateFilter('isHit', e.target.checked ? true : null)}
              className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-secondary-700">Хіти продажів</span>
          </label>
        </div>
      </div>

      {/* Help block */}
      <div className="rounded-lg bg-primary-50 p-4">
        <h4 className="mb-2 font-medium text-primary-900">Потрібна допомога?</h4>
        <p className="mb-3 text-sm text-primary-700">
          Наші консультанти допоможуть вам обрати ідеальний товар
        </p>
        <a
          href="tel:0800123456"
          className="text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          📞 0 800 123 456
        </a>
      </div>
    </div>
  )
}
