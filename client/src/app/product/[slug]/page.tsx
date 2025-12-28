import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight, Truck, Shield, RefreshCw } from 'lucide-react'
import { getProduct, getRelatedProducts } from '@/lib/directus/client'
import { ProductGrid } from '@/components/product/ProductGrid'
import { AddToCartButton } from '@/components/product/AddToCartButton'

// Revalidate data every 60 seconds (ISR)
export const revalidate = 60

interface ProductPageProps {
  params: { slug: string }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProduct(params.slug)
  
  if (!product) {
    return { title: 'Товар не знайдено' }
  }

  return {
    title: `${product.name} | SHTORA`,
    description: product.description || `Купити ${product.name} в інтернет-магазині SHTORA`,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.image ? [product.image] : [],
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct(params.slug)

  if (!product) {
    notFound()
  }

  const relatedProducts = product.categorySlug 
    ? await getRelatedProducts(product.categorySlug, product.id)
    : []

  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : null

  return (
    <div className="py-6 md:py-10">
      <div className="container">
        {/* Breadcrumbs */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-secondary-500">
          <Link href="/" className="hover:text-primary-600">
            Головна
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/catalog" className="hover:text-primary-600">
            Каталог
          </Link>
          {product.category && (
            <>
              <ChevronRight className="h-4 w-4" />
              <Link
                href={`/catalog/${product.categorySlug}`}
                className="hover:text-primary-600"
              >
                {product.category}
              </Link>
            </>
          )}
          <ChevronRight className="h-4 w-4" />
          <span className="text-secondary-900">{product.name}</span>
        </nav>

        {/* Product content */}
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-xl bg-secondary-100">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="text-9xl opacity-30">🪟</span>
                </div>
              )}
              {/* Badges */}
              <div className="absolute left-4 top-4 flex flex-col gap-2">
                {discount && (
                  <span className="rounded-lg bg-red-500 px-3 py-1 text-sm font-medium text-white">
                    -{discount}%
                  </span>
                )}
                {product.isNew && (
                  <span className="rounded-lg bg-green-500 px-3 py-1 text-sm font-medium text-white">
                    Новинка
                  </span>
                )}
                {product.isHit && (
                  <span className="rounded-lg bg-primary-500 px-3 py-1 text-sm font-medium text-white">
                    Хіт продажів
                  </span>
                )}
              </div>
            </div>
            {/* Thumbnail gallery */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-secondary-100"
                  >
                    <Image
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div>
            <h1 className="mb-4 text-2xl font-bold md:text-3xl">{product.name}</h1>

            {/* Rating */}
            {product.rating && (
              <div className="mb-4 flex items-center gap-2">
                <div className="flex text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>
                      {i < Math.floor(product.rating!) ? '★' : '☆'}
                    </span>
                  ))}
                </div>
                <span className="text-secondary-600">{product.rating}</span>
                {product.reviewsCount && (
                  <span className="text-secondary-400">
                    ({product.reviewsCount} відгуків)
                  </span>
                )}
              </div>
            )}

            {/* Price */}
            <div className="mb-6 flex items-baseline gap-3">
              <span className="text-3xl font-bold text-secondary-900">
                {product.price.toLocaleString('uk-UA')} ₴
              </span>
              {product.oldPrice && (
                <span className="text-xl text-secondary-400 line-through">
                  {product.oldPrice.toLocaleString('uk-UA')} ₴
                </span>
              )}
            </div>

            {/* Availability */}
            <div className="mb-6">
              {product.inStock ? (
                <span className="inline-flex items-center gap-2 text-green-600">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  В наявності
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 text-red-500">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  Немає в наявності
                </span>
              )}
              {product.sku && (
                <span className="ml-4 text-secondary-400">
                  Артикул: {product.sku}
                </span>
              )}
            </div>

            {/* Attributes */}
            {(product.material || product.color || product.width || product.height) && (
              <div className="mb-6 space-y-2 rounded-lg bg-secondary-50 p-4">
                {product.material && (
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Матеріал:</span>
                    <span className="font-medium">{product.material}</span>
                  </div>
                )}
                {product.color && (
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Колір:</span>
                    <span className="font-medium">{product.color}</span>
                  </div>
                )}
                {product.width && (
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Ширина:</span>
                    <span className="font-medium">{product.width} см</span>
                  </div>
                )}
                {product.height && (
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Висота:</span>
                    <span className="font-medium">{product.height} см</span>
                  </div>
                )}
              </div>
            )}

            {/* Add to cart */}
            <AddToCartButton product={product} />

            {/* Features */}
            <div className="mt-8 grid gap-4 border-t pt-6 sm:grid-cols-3">
              <div className="flex items-center gap-3">
                <Truck className="h-6 w-6 text-primary-600" />
                <div>
                  <p className="font-medium">Доставка</p>
                  <p className="text-sm text-secondary-500">1-2 дні</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-primary-600" />
                <div>
                  <p className="font-medium">Гарантія</p>
                  <p className="text-sm text-secondary-500">12 місяців</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <RefreshCw className="h-6 w-6 text-primary-600" />
                <div>
                  <p className="font-medium">Повернення</p>
                  <p className="text-sm text-secondary-500">14 днів</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div className="mt-12 border-t pt-8">
            <h2 className="mb-4 text-xl font-bold">Опис товару</h2>
            <div className="prose max-w-none text-secondary-600">
              <p>{product.description}</p>
            </div>
          </div>
        )}

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12 border-t pt-8">
            <h2 className="mb-6 text-xl font-bold">Схожі товари</h2>
            <ProductGrid products={relatedProducts} columns={4} />
          </div>
        )}
      </div>
    </div>
  )
}
