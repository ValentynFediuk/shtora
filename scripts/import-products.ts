/**
 * Скрипт імпорту товарів з CSV в Directus
 * 
 * Використання:
 * 1. Встановіть змінну середовища DIRECTUS_ADMIN_TOKEN
 * 2. Запустіть: npx ts-node scripts/import-products.ts
 * 
 * Або через Directus Admin UI:
 * 1. Відкрийте https://shtora-production.up.railway.app/admin
 * 2. Перейдіть у Content -> Products
 * 3. Натисніть "+" для створення нового товару
 */

import * as fs from 'fs'
import * as path from 'path'

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'https://shtora-production.up.railway.app'
const DIRECTUS_TOKEN = process.env.DIRECTUS_ADMIN_TOKEN || ''

// Перші 20 товарів з CSV (дані вже парснуті)
const products = [
  {
    name: "Римська штора День-Ніч Тюль/Блекаут Перфект з бантами Чорний",
    variant: "100*170 см",
    price: 3218.80,
    old_price: 3236.88,
    description: "Римська штора День-Ніч з бантами - це сучасний, функціональний та практичний виріб для вашого вікна.",
    images: ["blekaut-23-.jpg", "i70334014-0d6118841faeaab73da2b9ec56c9763d_1.jpg", "i12889747-af57ddd965f4235e0113339780983301_4.jpg"],
    slug: "rimska-shtora-den-nich-chornij-100x170",
    color: "Чорний",
    material: "Тюль/Блекаут",
    category: "РИМСЬКІ ШТОРИ/ЗАТЕМНЮЮЧІ ШТОРИ/ДЕНЬ-НІЧ З БАНТАМИ CLASSIC",
    brand: "DECOLIV",
    width: 100,
    height: 170,
  },
  {
    name: "Римська штора День-Ніч Тюль/Блекаут Перфект з бантами Чорний",
    variant: "110*170 см",
    price: 3428.91,
    old_price: 3458.15,
    description: "Римська штора День-Ніч з бантами - це сучасний, функціональний та практичний виріб для вашого вікна.",
    images: ["blekaut-23-.jpg", "i70334014-0d6118841faeaab73da2b9ec56c9763d_1.jpg", "i12889747-af57ddd965f4235e0113339780983301_4.jpg"],
    slug: "rimska-shtora-den-nich-chornij-110x170",
    color: "Чорний",
    material: "Тюль/Блекаут",
    category: "РИМСЬКІ ШТОРИ/ЗАТЕМНЮЮЧІ ШТОРИ/ДЕНЬ-НІЧ З БАНТАМИ CLASSIC",
    brand: "DECOLIV",
    width: 110,
    height: 170,
  },
  {
    name: "Римська штора День-Ніч Тюль/Блекаут Перфект з бантами Чорний",
    variant: "120*170 см",
    price: 3572.87,
    old_price: 3609.76,
    description: "Римська штора День-Ніч з бантами - це сучасний, функціональний та практичний виріб для вашого вікна.",
    images: ["blekaut-23-.jpg", "i70334014-0d6118841faeaab73da2b9ec56c9763d_1.jpg", "i12889747-af57ddd965f4235e0113339780983301_4.jpg"],
    slug: "rimska-shtora-den-nich-chornij-120x170",
    color: "Чорний",
    material: "Тюль/Блекаут",
    category: "РИМСЬКІ ШТОРИ/ЗАТЕМНЮЮЧІ ШТОРИ/ДЕНЬ-НІЧ З БАНТАМИ CLASSIC",
    brand: "DECOLIV",
    width: 120,
    height: 170,
  },
  {
    name: "Римська штора День-Ніч Тюль/Блекаут Перфект з бантами Чорний",
    variant: "130*170 см",
    price: 3715.16,
    old_price: 3759.60,
    description: "Римська штора День-Ніч з бантами - це сучасний, функціональний та практичний виріб для вашого вікна.",
    images: ["blekaut-23-.jpg", "i70334014-0d6118841faeaab73da2b9ec56c9763d_1.jpg", "i12889747-af57ddd965f4235e0113339780983301_4.jpg"],
    slug: "rimska-shtora-den-nich-chornij-130x170",
    color: "Чорний",
    material: "Тюль/Блекаут",
    category: "РИМСЬКІ ШТОРИ/ЗАТЕМНЮЮЧІ ШТОРИ/ДЕНЬ-НІЧ З БАНТАМИ CLASSIC",
    brand: "DECOLIV",
    width: 130,
    height: 170,
  },
  {
    name: "Римська штора День-Ніч Тюль/Блекаут Перфект з бантами Чорний",
    variant: "140*170 см",
    price: 3857.48,
    old_price: 3909.48,
    description: "Римська штора День-Ніч з бантами - це сучасний, функціональний та практичний виріб для вашого вікна.",
    images: ["blekaut-23-.jpg", "i70334014-0d6118841faeaab73da2b9ec56c9763d_1.jpg", "i12889747-af57ddd965f4235e0113339780983301_4.jpg"],
    slug: "rimska-shtora-den-nich-chornij-140x170",
    color: "Чорний",
    material: "Тюль/Блекаут",
    category: "РИМСЬКІ ШТОРИ/ЗАТЕМНЮЮЧІ ШТОРИ/ДЕНЬ-НІЧ З БАНТАМИ CLASSIC",
    brand: "DECOLIV",
    width: 140,
    height: 170,
  },
  {
    name: "Римська штора День-Ніч Тюль/Блекаут Перфект з бантами Чорний",
    variant: "150*170 см",
    price: 3999.78,
    old_price: 4059.32,
    description: "Римська штора День-Ніч з бантами - це сучасний, функціональний та практичний виріб для вашого вікна.",
    images: ["blekaut-23-.jpg", "i70334014-0d6118841faeaab73da2b9ec56c9763d_1.jpg", "i12889747-af57ddd965f4235e0113339780983301_4.jpg"],
    slug: "rimska-shtora-den-nich-chornij-150x170",
    color: "Чорний",
    material: "Тюль/Блекаут",
    category: "РИМСЬКІ ШТОРИ/ЗАТЕМНЮЮЧІ ШТОРИ/ДЕНЬ-НІЧ З БАНТАМИ CLASSIC",
    brand: "DECOLIV",
    width: 150,
    height: 170,
  },
  {
    name: "Римська штора День-Ніч Тюль/Блекаут Перфект з бантами Чорний",
    variant: "160*170 см",
    price: 4213.22,
    old_price: 4284.12,
    description: "Римська штора День-Ніч з бантами - це сучасний, функціональний та практичний виріб для вашого вікна.",
    images: ["blekaut-23-.jpg", "i70334014-0d6118841faeaab73da2b9ec56c9763d_1.jpg", "i12889747-af57ddd965f4235e0113339780983301_4.jpg"],
    slug: "rimska-shtora-den-nich-chornij-160x170",
    color: "Чорний",
    material: "Тюль/Блекаут",
    category: "РИМСЬКІ ШТОРИ/ЗАТЕМНЮЮЧІ ШТОРИ/ДЕНЬ-НІЧ З БАНТАМИ CLASSIC",
    brand: "DECOLIV",
    width: 160,
    height: 170,
  },
  {
    name: "Римська штора День-Ніч Тюль/Блекаут Перфект з бантами Чорний",
    variant: "170*170 см",
    price: 4355.53,
    old_price: 4433.98,
    description: "Римська штора День-Ніч з бантами - це сучасний, функціональний та практичний виріб для вашого вікна.",
    images: ["blekaut-23-.jpg", "i70334014-0d6118841faeaab73da2b9ec56c9763d_1.jpg", "i12889747-af57ddd965f4235e0113339780983301_4.jpg"],
    slug: "rimska-shtora-den-nich-chornij-170x170",
    color: "Чорний",
    material: "Тюль/Блекаут",
    category: "РИМСЬКІ ШТОРИ/ЗАТЕМНЮЮЧІ ШТОРИ/ДЕНЬ-НІЧ З БАНТАМИ CLASSIC",
    brand: "DECOLIV",
    width: 170,
    height: 170,
  },
  {
    name: "Римська штора День-Ніч Тюль/Блекаут Перфект з бантами Чорний",
    variant: "180*170 см",
    price: 4496.16,
    old_price: 4582.09,
    description: "Римська штора День-Ніч з бантами - це сучасний, функціональний та практичний виріб для вашого вікна.",
    images: ["blekaut-23-.jpg", "i70334014-0d6118841faeaab73da2b9ec56c9763d_1.jpg", "i12889747-af57ddd965f4235e0113339780983301_4.jpg"],
    slug: "rimska-shtora-den-nich-chornij-180x170",
    color: "Чорний",
    material: "Тюль/Блекаут",
    category: "РИМСЬКІ ШТОРИ/ЗАТЕМНЮЮЧІ ШТОРИ/ДЕНЬ-НІЧ З БАНТАМИ CLASSIC",
    brand: "DECOLIV",
    width: 180,
    height: 170,
  },
  {
    name: "Римська штора День-Ніч Тюль/Блекаут Перфект з бантами Чорний",
    variant: "190*170 см",
    price: 4638.48,
    old_price: 4731.95,
    description: "Римська штора День-Ніч з бантами - це сучасний, функціональний та практичний виріб для вашого вікна.",
    images: ["blekaut-23-.jpg", "i70334014-0d6118841faeaab73da2b9ec56c9763d_1.jpg", "i12889747-af57ddd965f4235e0113339780983301_4.jpg"],
    slug: "rimska-shtora-den-nich-chornij-190x170",
    color: "Чорний",
    material: "Тюль/Блекаут",
    category: "РИМСЬКІ ШТОРИ/ЗАТЕМНЮЮЧІ ШТОРИ/ДЕНЬ-НІЧ З БАНТАМИ CLASSIC",
    brand: "DECOLIV",
    width: 190,
    height: 170,
  },
  {
    name: "Римська штора День-Ніч Тюль/Блекаут Перфект з бантами Чорний",
    variant: "200*170 см",
    price: 4803.94,
    old_price: 4906.21,
    description: "Римська штора День-Ніч з бантами - це сучасний, функціональний та практичний виріб для вашого вікна.",
    images: ["blekaut-23-.jpg", "i70334014-0d6118841faeaab73da2b9ec56c9763d_1.jpg", "i12889747-af57ddd965f4235e0113339780983301_4.jpg"],
    slug: "rimska-shtora-den-nich-chornij-200x170",
    color: "Чорний",
    material: "Тюль/Блекаут",
    category: "РИМСЬКІ ШТОРИ/ЗАТЕМНЮЮЧІ ШТОРИ/ДЕНЬ-НІЧ З БАНТАМИ CLASSIC",
    brand: "DECOLIV",
    width: 200,
    height: 170,
  },
  {
    name: "Римська штора День-Ніч Тюль/Блекаут Перфект з бантами Чорний",
    variant: "210*170 см",
    price: 5015.74,
    old_price: 5129.26,
    description: "Римська штора День-Ніч з бантами - це сучасний, функціональний та практичний виріб для вашого вікна.",
    images: ["blekaut-23-.jpg", "i70334014-0d6118841faeaab73da2b9ec56c9763d_1.jpg", "i12889747-af57ddd965f4235e0113339780983301_4.jpg"],
    slug: "rimska-shtora-den-nich-chornij-210x170",
    color: "Чорний",
    material: "Тюль/Блекаут",
    category: "РИМСЬКІ ШТОРИ/ЗАТЕМНЮЮЧІ ШТОРИ/ДЕНЬ-НІЧ З БАНТАМИ CLASSIC",
    brand: "DECOLIV",
    width: 210,
    height: 170,
  },
  {
    name: "Римська штора День-Ніч Тюль/Блекаут Перфект з бантами Чорний",
    variant: "220*170 см",
    price: 5158.04,
    old_price: 5279.12,
    description: "Римська штора День-Ніч з бантами - це сучасний, функціональний та практичний виріб для вашого вікна.",
    images: ["blekaut-23-.jpg", "i70334014-0d6118841faeaab73da2b9ec56c9763d_1.jpg", "i12889747-af57ddd965f4235e0113339780983301_4.jpg"],
    slug: "rimska-shtora-den-nich-chornij-220x170",
    color: "Чорний",
    material: "Тюль/Блекаут",
    category: "РИМСЬКІ ШТОРИ/ЗАТЕМНЮЮЧІ ШТОРИ/ДЕНЬ-НІЧ З БАНТАМИ CLASSIC",
    brand: "DECOLIV",
    width: 220,
    height: 170,
  },
  {
    name: "Римська штора День-Ніч Тюль/Блекаут Перфект з бантами Чорний",
    variant: "230*170 см",
    price: 5300.34,
    old_price: 5428.98,
    description: "Римська штора День-Ніч з бантами - це сучасний, функціональний та практичний виріб для вашого вікна.",
    images: ["blekaut-23-.jpg", "i70334014-0d6118841faeaab73da2b9ec56c9763d_1.jpg", "i12889747-af57ddd965f4235e0113339780983301_4.jpg"],
    slug: "rimska-shtora-den-nich-chornij-230x170",
    color: "Чорний",
    material: "Тюль/Блекаут",
    category: "РИМСЬКІ ШТОРИ/ЗАТЕМНЮЮЧІ ШТОРИ/ДЕНЬ-НІЧ З БАНТАМИ CLASSIC",
    brand: "DECOLIV",
    width: 230,
    height: 170,
  },
  {
    name: "Римська штора День-Ніч Тюль/Блекаут Перфект з бантами Чорний",
    variant: "240*170 см",
    price: 5445.94,
    old_price: 5582.32,
    description: "Римська штора День-Ніч з бантами - це сучасний, функціональний та практичний виріб для вашого вікна.",
    images: ["blekaut-23-.jpg", "i70334014-0d6118841faeaab73da2b9ec56c9763d_1.jpg", "i12889747-af57ddd965f4235e0113339780983301_4.jpg"],
    slug: "rimska-shtora-den-nich-chornij-240x170",
    color: "Чорний",
    material: "Тюль/Блекаут",
    category: "РИМСЬКІ ШТОРИ/ЗАТЕМНЮЮЧІ ШТОРИ/ДЕНЬ-НІЧ З БАНТАМИ CLASSIC",
    brand: "DECOLIV",
    width: 240,
    height: 170,
  },
  {
    name: "Римська штора День-Ніч Тюль/Блекаут Перфект з бантами Чорний",
    variant: "250*170 см",
    price: 5629.62,
    old_price: 5775.74,
    description: "Римська штора День-Ніч з бантами - це сучасний, функціональний та практичний виріб для вашого вікна.",
    images: ["blekaut-23-.jpg", "i70334014-0d6118841faeaab73da2b9ec56c9763d_1.jpg", "i12889747-af57ddd965f4235e0113339780983301_4.jpg"],
    slug: "rimska-shtora-den-nich-chornij-250x170",
    color: "Чорний",
    material: "Тюль/Блекаут",
    category: "РИМСЬКІ ШТОРИ/ЗАТЕМНЮЮЧІ ШТОРИ/ДЕНЬ-НІЧ З БАНТАМИ CLASSIC",
    brand: "DECOLIV",
    width: 250,
    height: 170,
  },
  {
    name: "Римська штора День-Ніч Тюль/Блекаут Перфект з бантами Чорний",
    variant: "260*170 см",
    price: 5819.90,
    old_price: 5976.13,
    description: "Римська штора День-Ніч з бантами - це сучасний, функціональний та практичний виріб для вашого вікна.",
    images: ["blekaut-23-.jpg", "i70334014-0d6118841faeaab73da2b9ec56c9763d_1.jpg", "i12889747-af57ddd965f4235e0113339780983301_4.jpg"],
    slug: "rimska-shtora-den-nich-chornij-260x170",
    color: "Чорний",
    material: "Тюль/Блекаут",
    category: "РИМСЬКІ ШТОРИ/ЗАТЕМНЮЮЧІ ШТОРИ/ДЕНЬ-НІЧ З БАНТАМИ CLASSIC",
    brand: "DECOLIV",
    width: 260,
    height: 170,
  },
  {
    name: "Римська штора День-Ніч Тюль/Блекаут Перфект з бантами Чорний",
    variant: "270*170 см",
    price: 6005.23,
    old_price: 6171.30,
    description: "Римська штора День-Ніч з бантами - це сучасний, функціональний та практичний виріб для вашого вікна.",
    images: ["blekaut-23-.jpg", "i70334014-0d6118841faeaab73da2b9ec56c9763d_1.jpg", "i12889747-af57ddd965f4235e0113339780983301_4.jpg"],
    slug: "rimska-shtora-den-nich-chornij-270x170",
    color: "Чорний",
    material: "Тюль/Блекаут",
    category: "РИМСЬКІ ШТОРИ/ЗАТЕМНЮЮЧІ ШТОРИ/ДЕНЬ-НІЧ З БАНТАМИ CLASSIC",
    brand: "DECOLIV",
    width: 270,
    height: 170,
  },
  {
    name: "Римська штора День-Ніч Тюль/Блекаут Перфект з бантами Чорний",
    variant: "280*170 см",
    price: 6192.20,
    old_price: 6368.20,
    description: "Римська штора День-Ніч з бантами - це сучасний, функціональний та практичний виріб для вашого вікна.",
    images: ["blekaut-23-.jpg", "i70334014-0d6118841faeaab73da2b9ec56c9763d_1.jpg", "i12889747-af57ddd965f4235e0113339780983301_4.jpg"],
    slug: "rimska-shtora-den-nich-chornij-280x170",
    color: "Чорний",
    material: "Тюль/Блекаут",
    category: "РИМСЬКІ ШТОРИ/ЗАТЕМНЮЮЧІ ШТОРИ/ДЕНЬ-НІЧ З БАНТАМИ CLASSIC",
    brand: "DECOLIV",
    width: 280,
    height: 170,
  },
  {
    name: "Римська штора День-Ніч Тюль/Блекаут Перфект з бантами Чорний",
    variant: "290*170 см",
    price: 6380.83,
    old_price: 6566.85,
    description: "Римська штора День-Ніч з бантами - це сучасний, функціональний та практичний виріб для вашого вікна.",
    images: ["blekaut-23-.jpg", "i70334014-0d6118841faeaab73da2b9ec56c9763d_1.jpg", "i12889747-af57ddd965f4235e0113339780983301_4.jpg"],
    slug: "rimska-shtora-den-nich-chornij-290x170",
    color: "Чорний",
    material: "Тюль/Блекаут",
    category: "РИМСЬКІ ШТОРИ/ЗАТЕМНЮЮЧІ ШТОРИ/ДЕНЬ-НІЧ З БАНТАМИ CLASSIC",
    brand: "DECOLIV",
    width: 290,
    height: 170,
  },
]

interface DirectusProduct {
  status: string
  slug: string
  name: string
  description: string
  price: number
  old_price: number | null
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
  // Поля калькулятора цін
  price_per_sqm: number | null
  min_width: number | null
  max_width: number | null
  min_height: number | null
  max_height: number | null
  fixed_height: number | null
}

// Інтерфейс для консолідованого продукту
interface ConsolidatedProduct {
  name: string
  description: string
  images: string[]
  slug: string
  color: string
  material: string
  category: string
  brand: string
  variants: Array<{
    width: number
    height: number
    price: number
    old_price: number
  }>
}

// Функція для консолідації варіантів продуктів
function consolidateProducts(rawProducts: typeof products): ConsolidatedProduct[] {
  const productMap = new Map<string, ConsolidatedProduct>()
  
  for (const p of rawProducts) {
    // Генеруємо базовий slug без розміру
    const baseSlug = p.slug.replace(/-\d+x\d+$/, '')
    
    if (!productMap.has(baseSlug)) {
      productMap.set(baseSlug, {
        name: p.name,
        description: p.description,
        images: p.images,
        slug: baseSlug,
        color: p.color,
        material: p.material,
        category: p.category,
        brand: p.brand,
        variants: []
      })
    }
    
    productMap.get(baseSlug)!.variants.push({
      width: p.width,
      height: p.height,
      price: p.price,
      old_price: p.old_price
    })
  }
  
  return Array.from(productMap.values())
}

// Функція для розрахунку ціни за кв.м
function calculatePricePerSqm(variants: ConsolidatedProduct['variants']): number {
  // Беремо середнє значення price_per_sqm з усіх варіантів
  const pricesPerSqm = variants.map(v => {
    const area = (v.width / 100) * (v.height / 100)
    return v.price / area
  })
  
  const avgPricePerSqm = pricesPerSqm.reduce((a, b) => a + b, 0) / pricesPerSqm.length
  return Math.round(avgPricePerSqm * 100) / 100
}

async function createConsolidatedProduct(product: ConsolidatedProduct): Promise<void> {
  // Отримуємо статистику з варіантів
  const widths = product.variants.map(v => v.width)
  const heights = product.variants.map(v => v.height)
  const prices = product.variants.map(v => v.price)
  const oldPrices = product.variants.map(v => v.old_price)
  
  const minWidth = Math.min(...widths)
  const maxWidth = Math.max(...widths)
  const minHeight = Math.min(...heights)
  const maxHeight = Math.max(...heights)
  const basePrice = Math.min(...prices)
  const baseOldPrice = Math.min(...oldPrices)
  
  // Перевіряємо чи висота фіксована (всі варіанти мають однакову висоту)
  const uniqueHeights = [...new Set(heights)]
  const fixedHeight = uniqueHeights.length === 1 ? uniqueHeights[0] : null
  
  // Розраховуємо ціну за кв.м
  const pricePerSqm = calculatePricePerSqm(product.variants)
  
  // Генеруємо список розмірів для відображення
  const sizes = product.variants.map(v => `${v.width}x${v.height}`)

  const directusProduct: DirectusProduct = {
    status: 'published',
    slug: product.slug,
    name: product.name,
    description: product.description,
    price: basePrice,
    old_price: baseOldPrice,
    sku: `${product.slug}-sku`,
    material: product.material,
    color: product.color,
    sizes: sizes,
    width: minWidth,
    height: fixedHeight || minHeight,
    in_stock: true,
    is_new: true,
    is_hit: false,
    rating: 0,
    reviews_count: 0,
    // Поля калькулятора
    price_per_sqm: pricePerSqm,
    min_width: minWidth,
    max_width: maxWidth,
    min_height: fixedHeight ? null : minHeight,
    max_height: fixedHeight ? null : maxHeight,
    fixed_height: fixedHeight,
  }

  const response = await fetch(`${DIRECTUS_URL}/items/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
    },
    body: JSON.stringify(directusProduct),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to create product: ${error}`)
  }

  const result = await response.json() as { data: { id: string } }
  console.log(`✅ Створено товар: ${directusProduct.name} (ID: ${result.data.id})`)
  console.log(`   📐 Розміри: ${minWidth}-${maxWidth} × ${fixedHeight || `${minHeight}-${maxHeight}`} см`)
  console.log(`   💰 Ціна за м²: ${pricePerSqm} грн`)
}

async function main() {
  // Консолідуємо варіанти в унікальні продукти
  const consolidatedProducts = consolidateProducts(products)
  
  if (!DIRECTUS_TOKEN) {
    console.error('❌ Помилка: Не встановлено DIRECTUS_ADMIN_TOKEN')
    console.log('')
    console.log('Для імпорту товарів потрібен токен адміністратора Directus.')
    console.log('')
    console.log('Варіант 1: Через змінну середовища')
    console.log('  export DIRECTUS_ADMIN_TOKEN="ваш_токен"')
    console.log('  npx ts-node scripts/import-products.ts')
    console.log('')
    console.log('Варіант 2: Ручний імпорт через Directus Admin')
    console.log(`  1. Відкрийте ${DIRECTUS_URL}/admin`)
    console.log('  2. Увійдіть з правами адміністратора')
    console.log('  3. Перейдіть у Content -> Products')
    console.log('  4. Створіть товари вручну')
    console.log('')
    console.log(`Дані для імпорту (${consolidatedProducts.length} консолідованих товарів з ${products.length} варіантів):`)
    console.log('─'.repeat(60))
    
    consolidatedProducts.forEach((p, i) => {
      const widths = p.variants.map(v => v.width)
      const heights = p.variants.map(v => v.height)
      const prices = p.variants.map(v => v.price)
      
      const minWidth = Math.min(...widths)
      const maxWidth = Math.max(...widths)
      const uniqueHeights = [...new Set(heights)]
      const fixedHeight = uniqueHeights.length === 1 ? uniqueHeights[0] : null
      const basePrice = Math.min(...prices)
      const pricePerSqm = calculatePricePerSqm(p.variants)
      
      console.log(`${i + 1}. ${p.name}`)
      console.log(`   Slug: ${p.slug}`)
      console.log(`   Колір: ${p.color}`)
      console.log(`   Варіантів: ${p.variants.length}`)
      console.log(`   📐 Ширина: ${minWidth}-${maxWidth} см`)
      if (fixedHeight) {
        console.log(`   📐 Висота: ${fixedHeight} см (фіксована)`)
      } else {
        console.log(`   📐 Висота: ${Math.min(...heights)}-${Math.max(...heights)} см`)
      }
      console.log(`   💰 Базова ціна: ${basePrice} грн`)
      console.log(`   💰 Ціна за м²: ${pricePerSqm} грн`)
      console.log('')
    })
    
    return
  }

  console.log('🚀 Початок імпорту товарів у Directus...')
  console.log(`📍 URL: ${DIRECTUS_URL}`)
  console.log(`📦 Консолідованих товарів: ${consolidatedProducts.length} (з ${products.length} варіантів)`)
  console.log('')

  let success = 0
  let failed = 0

  for (const product of consolidatedProducts) {
    try {
      await createConsolidatedProduct(product)
      success++
    } catch (error) {
      console.error(`❌ Помилка імпорту "${product.name}":`, error)
      failed++
    }
  }

  console.log('')
  console.log('─'.repeat(50))
  console.log(`✅ Успішно імпортовано: ${success}`)
  console.log(`❌ Помилок: ${failed}`)
}

main().catch(console.error)
