import { ProductCard } from './ProductCard'
import type { Product } from '@/types'

// Mock data for demonstration
const mockProducts: Product[] = [
  {
    id: '1',
    slug: 'shtora-velvet-emerald',
    name: 'Штора оксамитова "Смарагд" 150x270 см',
    price: 2450,
    oldPrice: 3200,
    image: null,
    category: 'Штори',
    rating: 4.8,
    reviewsCount: 124,
    inStock: true,
    isNew: false,
    isHit: true,
  },
  {
    id: '2',
    slug: 'tiul-white-classic',
    name: 'Тюль біла класична "Ніжність" 300x280 см',
    price: 890,
    image: null,
    category: 'Тюль',
    rating: 4.9,
    reviewsCount: 89,
    inStock: true,
    isNew: true,
    isHit: false,
  },
  {
    id: '3',
    slug: 'karnyz-metal-gold',
    name: 'Карниз металевий золотий 200 см',
    price: 1650,
    oldPrice: 2100,
    image: null,
    category: 'Карнизи',
    rating: 4.7,
    reviewsCount: 56,
    inStock: true,
    isNew: false,
    isHit: false,
  },
  {
    id: '4',
    slug: 'shtora-blackout-grey',
    name: 'Штора блекаут сіра 200x270 см',
    price: 3100,
    image: null,
    category: 'Штори',
    rating: 4.9,
    reviewsCount: 201,
    inStock: true,
    isNew: false,
    isHit: true,
  },
  {
    id: '5',
    slug: 'podushka-velvet-beige',
    name: 'Подушка декоративна оксамит бежева 45x45',
    price: 450,
    oldPrice: 590,
    image: null,
    category: 'Текстиль',
    rating: 4.6,
    reviewsCount: 78,
    inStock: true,
    isNew: true,
    isHit: false,
  },
  {
    id: '6',
    slug: 'roleta-day-night',
    name: 'Ролета День-Ніч 120x180 см',
    price: 1890,
    image: null,
    category: 'Ролети',
    rating: 4.8,
    reviewsCount: 145,
    inStock: false,
    isNew: false,
    isHit: true,
  },
  {
    id: '7',
    slug: 'tiul-embroidered',
    name: 'Тюль з вишивкою "Квітковий мотив" 400x280 см',
    price: 1750,
    image: null,
    category: 'Тюль',
    rating: 4.7,
    reviewsCount: 67,
    inStock: true,
    isNew: true,
    isHit: false,
  },
  {
    id: '8',
    slug: 'pled-wool-grey',
    name: 'Плед вовняний сірий 150x200 см',
    price: 2200,
    oldPrice: 2800,
    image: null,
    category: 'Текстиль',
    rating: 4.9,
    reviewsCount: 112,
    inStock: true,
    isNew: false,
    isHit: false,
  },
]

interface ProductGridProps {
  products?: Product[]
  columns?: 2 | 3 | 4
}

export function ProductGrid({ products = mockProducts, columns = 4 }: ProductGridProps) {
  const gridCols = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }

  return (
    <div className={`grid gap-4 md:gap-6 ${gridCols[columns]}`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
