import { createDirectus, rest, readItems, readItem } from '@directus/sdk'
import type { Product, Category, ProductFilter } from '@/types'

// Directus schema types
interface DirectusSchema {
  products: DirectusProduct[]
  categories: DirectusCategory[]
  orders: DirectusOrder[]
  reviews: DirectusReview[]
}

interface DirectusProduct {
  id: string
  status: 'published' | 'draft' | 'archived'
  slug: string
  name: string
  description: string
  price: number
  old_price: number | null
  image: string | null
  images: string[] | null
  category: string | DirectusCategory
  sku: string
  material: string | null
  color: string | null
  sizes: string[] | null
  width: number | null
  height: number | null
  in_stock: boolean
  is_new: boolean
  is_hit: boolean
  rating: number
  reviews_count: number
  date_created: string
  date_updated: string
  // Калькулятор ціни
  price_per_sqm: number | null
  min_width: number | null
  max_width: number | null
  min_height: number | null
  max_height: number | null
  fixed_height: number | null
}

interface DirectusCategory {
  id: string
  slug: string
  name: string
  description: string | null
  image: string | null
  parent: string | null
  products_count: number
}

interface DirectusOrder {
  id: string
  order_number: string
  status: string
  items: object[]
  subtotal: number
  shipping: number
  discount: number
  total: number
  customer_first_name: string
  customer_last_name: string
  customer_email: string
  customer_phone: string
  shipping_city: string
  shipping_warehouse: string
  payment_method: string
  payment_status: string
  notes: string | null
  date_created: string
  date_updated: string
}

interface DirectusReview {
  id: string
  product: string
  author: string
  rating: number
  text: string
  is_verified: boolean
  date_created: string
}

// Create Directus client
const directusUrl = process.env.DIRECTUS_URL || 'http://localhost:8055'

export const directus = createDirectus<DirectusSchema>(directusUrl).with(rest())

// Helper function to get image URL
export function getImageUrl(imageId: string | null): string | null {
  if (!imageId) return null
  return `${directusUrl}/assets/${imageId}`
}

// Transform Directus product to app Product type
function transformProduct(item: DirectusProduct): Product {
  // Handle category - can be null, string (ID), or object
  const categoryObj = item.category && typeof item.category === 'object' ? item.category : null
  
  return {
    id: item.id,
    slug: item.slug,
    name: item.name,
    description: item.description,
    price: Number(item.price) || 0,
    oldPrice: item.old_price ? Number(item.old_price) : undefined,
    image: getImageUrl(item.image),
    images: item.images?.map(getImageUrl).filter(Boolean) as string[] | undefined,
    category: categoryObj?.name || undefined,
    categorySlug: categoryObj?.slug || undefined,
    sku: item.sku,
    material: item.material || undefined,
    color: item.color || undefined,
    sizes: item.sizes || undefined,
    width: item.width || undefined,
    height: item.height || undefined,
    inStock: item.in_stock,
    isNew: item.is_new,
    isHit: item.is_hit,
    rating: Number(item.rating) || 0,
    reviewsCount: item.reviews_count,
    createdAt: item.date_created,
    updatedAt: item.date_updated,
    // Калькулятор ціни
    pricePerSqm: item.price_per_sqm ? Number(item.price_per_sqm) : undefined,
    minWidth: item.min_width ? Number(item.min_width) : undefined,
    maxWidth: item.max_width ? Number(item.max_width) : undefined,
    minHeight: item.min_height ? Number(item.min_height) : undefined,
    maxHeight: item.max_height ? Number(item.max_height) : undefined,
    fixedHeight: item.fixed_height ? Number(item.fixed_height) : undefined,
  }
}

// Transform Directus category to app Category type
function transformCategory(item: DirectusCategory): Category {
  return {
    id: item.id,
    slug: item.slug,
    name: item.name,
    description: item.description || undefined,
    image: getImageUrl(item.image) || undefined,
    parentId: item.parent || undefined,
    productsCount: item.products_count,
  }
}

// API Functions
export async function getProducts(filter?: ProductFilter): Promise<Product[]> {
  try {
    const queryFilter: Record<string, unknown> = {
      status: { _eq: 'published' },
    }

    if (filter?.category) {
      queryFilter['category'] = { slug: { _eq: filter.category } }
    }
    if (filter?.minPrice) {
      queryFilter['price'] = { ...queryFilter['price'] as object, _gte: filter.minPrice }
    }
    if (filter?.maxPrice) {
      queryFilter['price'] = { ...queryFilter['price'] as object, _lte: filter.maxPrice }
    }
    if (filter?.inStock !== undefined) {
      queryFilter['in_stock'] = { _eq: filter.inStock }
    }
    if (filter?.isNew) {
      queryFilter['is_new'] = { _eq: true }
    }
    if (filter?.isHit) {
      queryFilter['is_hit'] = { _eq: true }
    }
    if (filter?.search) {
      queryFilter['name'] = { _contains: filter.search }
    }
    if (filter?.sizes && filter.sizes.length > 0) {
      queryFilter['sizes'] = { _contains: filter.sizes[0] }
    }

    const sortMap: Record<string, string> = {
      price_asc: 'price',
      price_desc: '-price',
      newest: '-date_created',
      popular: '-reviews_count',
      rating: '-rating',
    }

    const sortValue = filter?.sort ? sortMap[filter.sort] : '-date_created'

    const items = await directus.request(
      readItems('products', {
        filter: queryFilter,
        sort: [sortValue] as any,
        limit: filter?.limit || 20,
        offset: filter?.page ? (filter.page - 1) * (filter.limit || 20) : 0,
        fields: ['*', { category: ['id', 'slug', 'name'] }],
      })
    )

    return (items as unknown as DirectusProduct[]).map(transformProduct)
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

export async function getProduct(slug: string): Promise<Product | null> {
  try {
    const items = await directus.request(
      readItems('products', {
        filter: { slug: { _eq: slug }, status: { _eq: 'published' } },
        limit: 1,
        fields: ['*', { category: ['id', 'slug', 'name'] }],
      })
    )

    if (Array.isArray(items) && items.length > 0) {
      return transformProduct(items[0] as unknown as DirectusProduct)
    }

    // Fallback: спробувати знайти товар без фільтра статусу (для draft товарів)
    const fallback = await directus.request(
      readItems('products', {
        filter: { slug: { _eq: slug } },
        limit: 1,
        fields: ['*', { category: ['id', 'slug', 'name'] }],
      })
    )
    if (Array.isArray(fallback) && fallback.length > 0) {
      return transformProduct(fallback[0] as unknown as DirectusProduct)
    }

    return null
  } catch (error) {
    console.error('Error fetching product:', error)
    throw error // Кидаємо помилку замість повернення null, щоб відрізнити "не знайдено" від "помилка API"
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const items = await directus.request(
      readItems('categories', {
        sort: ['name'] as any,
        fields: ['*'],
      })
    )

    return (items as unknown as DirectusCategory[]).map(transformCategory)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

export async function getCategory(slug: string): Promise<Category | null> {
  try {
    const items = await directus.request(
      readItems('categories', {
        filter: { slug: { _eq: slug } },
        limit: 1,
        fields: ['*'],
      })
    )

    if (items.length === 0) return null
    return transformCategory(items[0] as unknown as DirectusCategory)
  } catch (error) {
    console.error('Error fetching category:', error)
    return null
  }
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return getProducts({ isHit: true, limit: 8 })
}

export async function getNewProducts(): Promise<Product[]> {
  return getProducts({ isNew: true, limit: 8 })
}

export async function getRelatedProducts(categorySlug: string, excludeId: string): Promise<Product[]> {
  try {
    const items = await directus.request(
      readItems('products', {
        filter: {
          status: { _eq: 'published' },
          category: { slug: { _eq: categorySlug } },
          id: { _neq: excludeId },
        },
        limit: 4,
        fields: ['*', { category: ['id', 'slug', 'name'] }],
      })
    )

    return (items as unknown as DirectusProduct[]).map(transformProduct)
  } catch (error) {
    console.error('Error fetching related products:', error)
    return []
  }
}

export async function getAvailableSizes(): Promise<string[]> {
  try {
    const items = await directus.request(
      readItems('products', {
        filter: { status: { _eq: 'published' } },
        fields: ['sizes'],
        limit: -1,
      })
    )

    const allSizes = new Set<string>()
    ;(items as unknown as { sizes: string[] | null }[]).forEach((item) => {
      if (item.sizes && Array.isArray(item.sizes)) {
        item.sizes.forEach((size) => allSizes.add(size))
      }
    })

    return Array.from(allSizes).sort()
  } catch (error) {
    console.error('Error fetching available sizes:', error)
    return []
  }
}

// Отримати варіанти товару з різними розмірами (товари з тієї ж категорії з схожою назвою)
export async function getProductSizeVariants(product: Product): Promise<Product[]> {
  try {
    if (!product.categorySlug) return []

    // Отримуємо базову назву товару (без розмірів та чисел в кінці)
    const baseName = product.name
      .replace(/\s*\d+\s*[xх×]\s*\d+\s*(см|мм|м)?/gi, '') // видаляємо розміри типу "100x200 см"
      .replace(/\s*[-–]\s*\d+\s*(см|мм|м)?/gi, '') // видаляємо розміри типу "- 100 см"
      .replace(/\s+/g, ' ')
      .trim()

    // Шукаємо товари з тієї ж категорії
    const items = await directus.request(
      readItems('products', {
        filter: {
          status: { _eq: 'published' },
          category: { slug: { _eq: product.categorySlug } },
          id: { _neq: product.id },
        },
        limit: 10,
        fields: ['*', { category: ['id', 'slug', 'name'] }],
      })
    )

    const products = (items as unknown as DirectusProduct[]).map(transformProduct)

    // Фільтруємо товари з схожою базовою назвою
    const variants = products.filter((p) => {
      const pBaseName = p.name
        .replace(/\s*\d+\s*[xх×]\s*\d+\s*(см|мм|м)?/gi, '')
        .replace(/\s*[-–]\s*\d+\s*(см|мм|м)?/gi, '')
        .replace(/\s+/g, ' ')
        .trim()

      // Перевіряємо схожість назв (одна містить іншу або співпадають)
      return (
        pBaseName.toLowerCase() === baseName.toLowerCase() ||
        pBaseName.toLowerCase().includes(baseName.toLowerCase()) ||
        baseName.toLowerCase().includes(pBaseName.toLowerCase())
      )
    })

    // Якщо знайшли варіанти з схожою назвою - повертаємо їх
    if (variants.length > 0) {
      return variants
    }

    // Якщо не знайшли - повертаємо товари з тієї ж категорії з різними розмірами
    return products.filter((p) => p.sizes && p.sizes.length > 0).slice(0, 4)
  } catch (error) {
    console.error('Error fetching product size variants:', error)
    return []
  }
}
