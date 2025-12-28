import { ProductGrid } from '@/components/product/ProductGrid'
import { CategorySection } from '@/components/home/CategorySection'
import { HeroSection } from '@/components/home/HeroSection'
import { FeaturesSection } from '@/components/home/FeaturesSection'
import { getFeaturedProducts, getProducts } from '@/lib/directus/client'
import type { Product } from '@/types'

// Revalidate data every 60 seconds (ISR)
export const revalidate = 60

export default async function HomePage() {
  // Fetch products from Directus
  let products: Product[] = []
  
  try {
    // Try to get featured products first, fallback to all products
    const featuredProducts = await getFeaturedProducts()
    if (featuredProducts && featuredProducts.length > 0) {
      products = featuredProducts
    } else {
      const allProducts = await getProducts()
      products = allProducts.slice(0, 8) // Show first 8 products
    }
  } catch (error) {
    console.error('Failed to fetch products from Directus:', error)
  }

  return (
    <>
      <HeroSection />
      <CategorySection />
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold md:text-3xl">Популярні товари</h2>
            <a
              href="/catalog"
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              Дивитись всі →
            </a>
          </div>
          <ProductGrid products={products.length > 0 ? products : undefined} />
        </div>
      </section>
      <FeaturesSection />
      <section className="bg-primary-50 py-12 md:py-16">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-2xl font-bold md:text-3xl">
              Підпишіться на розсилку
            </h2>
            <p className="mb-6 text-secondary-600">
              Отримуйте новини про знижки та нові надходження першими
            </p>
            <form className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <input
                type="email"
                placeholder="Ваш email"
                className="input max-w-sm"
              />
              <button type="submit" className="btn-primary">
                Підписатися
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  )
}
