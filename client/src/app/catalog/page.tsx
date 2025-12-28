import { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, SlidersHorizontal } from 'lucide-react'
import { getProducts, getCategories } from '@/lib/directus/client'
import { ProductGrid } from '@/components/product/ProductGrid'
import { CatalogFilters } from '@/components/catalog/CatalogFilters'
import type { ProductFilter } from '@/types'

// Revalidate data every 60 seconds (ISR)
export const revalidate = 60

export const metadata: Metadata = {
  title: 'Каталог товарів | SHTORA',
  description: 'Великий вибір штор, тюлів, карнизів та домашнього текстилю. Знайдіть ідеальний товар для вашого інтер\'єру.',
}

interface CatalogPageProps {
  searchParams: {
    category?: string
    minPrice?: string
    maxPrice?: string
    inStock?: string
    isNew?: string
    isHit?: string
    sort?: string
    page?: string
  }
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const filter: ProductFilter = {
    category: searchParams.category,
    minPrice: searchParams.minPrice ? Number(searchParams.minPrice) : undefined,
    maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
    inStock: searchParams.inStock === 'true' ? true : undefined,
    isNew: searchParams.isNew === 'true' ? true : undefined,
    isHit: searchParams.isHit === 'true' ? true : undefined,
    sort: searchParams.sort as ProductFilter['sort'],
    page: searchParams.page ? Number(searchParams.page) : 1,
    limit: 12,
  }

  const [products, categories] = await Promise.all([
    getProducts(filter),
    getCategories(),
  ])

  const sortOptions = [
    { value: 'newest', label: 'Новинки' },
    { value: 'popular', label: 'Популярні' },
    { value: 'price_asc', label: 'Ціна: від низької' },
    { value: 'price_desc', label: 'Ціна: від високої' },
    { value: 'rating', label: 'За рейтингом' },
  ]

  return (
    <div className="py-6 md:py-10">
      <div className="container">
        {/* Breadcrumbs */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-secondary-500">
          <Link href="/" className="hover:text-primary-600">
            Головна
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-secondary-900">Каталог</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-2xl font-bold md:text-3xl">Каталог товарів</h1>
          <p className="text-secondary-600">
            Знайдено {products.length} товарів
          </p>
        </div>

        {/* Categories */}
        <div className="mb-8 flex flex-wrap gap-2">
          <Link
            href="/catalog"
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              !searchParams.category
                ? 'bg-primary-500 text-white'
                : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
            }`}
          >
            Всі товари
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/catalog?category=${cat.slug}`}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                searchParams.category === cat.slug
                  ? 'bg-primary-500 text-white'
                  : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-4">
          {/* Filters sidebar */}
          <aside className="hidden lg:block">
            <CatalogFilters categories={categories} currentFilter={filter} />
          </aside>

          {/* Products */}
          <div className="lg:col-span-3">
            {/* Sort and filter bar */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              {/* Mobile filter button */}
              <button
                type="button"
                className="btn-outline flex items-center gap-2 lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Фільтри
              </button>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-secondary-600">Сортування:</span>
                <select
                  defaultValue={searchParams.sort || 'newest'}
                  className="input w-auto py-1.5"
                  onChange={(e) => {
                    const url = new URL(window.location.href)
                    url.searchParams.set('sort', e.target.value)
                    window.location.href = url.toString()
                  }}
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Products grid */}
            {products.length > 0 ? (
              <ProductGrid products={products} columns={3} />
            ) : (
              <div className="rounded-xl bg-secondary-50 py-16 text-center">
                <p className="text-lg text-secondary-600">
                  Товарів за вашим запитом не знайдено
                </p>
                <Link href="/catalog" className="btn-primary mt-4 inline-block">
                  Скинути фільтри
                </Link>
              </div>
            )}

            {/* Pagination */}
            {products.length >= 12 && (
              <div className="mt-8 flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((page) => (
                  <Link
                    key={page}
                    href={`/catalog?page=${page}`}
                    className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      (filter.page || 1) === page
                        ? 'bg-primary-500 text-white'
                        : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                    }`}
                  >
                    {page}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
