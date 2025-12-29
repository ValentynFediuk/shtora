/**
 * Скрипт імпорту ВСІХ товарів з CSV в Directus
 * 
 * Використання:
 * DIRECTUS_ADMIN_TOKEN="ваш_токен" npx tsx scripts/import-all-products.ts
 */

import * as fs from 'fs'
import * as path from 'path'

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'https://shtora-production.up.railway.app'
const DIRECTUS_TOKEN = process.env.DIRECTUS_ADMIN_TOKEN || ''
const CSV_PATH = '/Users/valentynfediuk/webstormprojects/SHTORA/scripts/products-utf8.csv'

interface CSVProduct {
  category: string
  brand: string
  product: string
  variant: string
  sku: string
  price: number
  oldPrice: number
  description: string
  images: string[]
  url: string
  color: string
  material: string
}

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
  width: number | null
  height: number | null
  in_stock: boolean
  is_new: boolean
  is_hit: boolean
  rating: number
  reviews_count: number
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ';' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  result.push(current.trim())
  
  return result
}

function extractDimensions(variant: string): { width: number | null, height: number | null } {
  // Формат: "100*170 см" або "100x170 см"
  const match = variant.match(/(\d+)\s*[*x×]\s*(\d+)/i)
  if (match) {
    return {
      width: parseInt(match[1], 10),
      height: parseInt(match[2], 10)
    }
  }
  return { width: null, height: null }
}

function generateSlug(product: string, variant: string, index: number): string {
  // Транслітерація українських символів
  const translitMap: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'h', 'ґ': 'g', 'д': 'd', 'е': 'e', 'є': 'ye',
    'ж': 'zh', 'з': 'z', 'и': 'y', 'і': 'i', 'ї': 'yi', 'й': 'y', 'к': 'k', 'л': 'l',
    'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ь': '',
    'ю': 'yu', 'я': 'ya', 'ы': 'y', 'э': 'e', 'ё': 'yo',
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'H', 'Ґ': 'G', 'Д': 'D', 'Е': 'E', 'Є': 'Ye',
    'Ж': 'Zh', 'З': 'Z', 'И': 'Y', 'І': 'I', 'Ї': 'Yi', 'Й': 'Y', 'К': 'K', 'Л': 'L',
    'М': 'M', 'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
    'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shch', 'Ь': '',
    'Ю': 'Yu', 'Я': 'Ya', 'Ы': 'Y', 'Э': 'E', 'Ё': 'Yo'
  }
  
  let text = `${product} ${variant}`.toLowerCase()
  
  // Транслітерація
  text = text.split('').map(char => translitMap[char] || char).join('')
  
  // Замінити всі не-букви/цифри на дефіс
  text = text.replace(/[^a-z0-9]+/gi, '-')
  
  // Видалити подвійні дефіси та дефіси на початку/кінці
  text = text.replace(/-+/g, '-').replace(/^-|-$/g, '')
  
  // Додати унікальний індекс
  return `${text}-${index}`
}

function cleanDescription(html: string): string {
  if (!html) return ''
  
  // Видалити HTML теги
  let text = html.replace(/<[^>]*>/g, ' ')
  
  // Декодувати HTML entities
  text = text.replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
  
  // Видалити зайві пробіли
  text = text.replace(/\s+/g, ' ').trim()
  
  return text.substring(0, 5000) // Обмежити довжину
}

async function createProduct(product: DirectusProduct, retries = 3): Promise<boolean> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(`${DIRECTUS_URL}/items/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
        },
        body: JSON.stringify(product),
      })

      if (response.ok) {
        return true
      }
      
      if (response.status === 400) {
        // Можливо, дублікат slug
        const error = await response.text()
        if (error.includes('slug') || error.includes('unique')) {
          product.slug = `${product.slug}-${Date.now()}`
          continue
        }
      }
      
      if (attempt === retries) {
        const error = await response.text()
        console.error(`❌ Помилка створення "${product.name}": ${error}`)
        return false
      }
      
      // Почекати перед повтором
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
    } catch (error) {
      if (attempt === retries) {
        console.error(`❌ Помилка мережі для "${product.name}":`, error)
        return false
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
    }
  }
  return false
}

async function main() {
  if (!DIRECTUS_TOKEN) {
    console.error('❌ Помилка: Не встановлено DIRECTUS_ADMIN_TOKEN')
    console.log('Використання: DIRECTUS_ADMIN_TOKEN="ваш_токен" npx tsx scripts/import-all-products.ts')
    process.exit(1)
  }

  console.log('🚀 Читання CSV файлу...')
  
  let csvContent: string
  try {
    csvContent = fs.readFileSync(CSV_PATH, 'utf-8')
  } catch (error) {
    console.error(`❌ Не вдалося прочитати CSV файл: ${CSV_PATH}`)
    process.exit(1)
  }

  const lines = csvContent.split('\n').filter(line => line.trim())
  console.log(`📊 Знайдено ${lines.length - 1} рядків у CSV (без заголовка)`)

  // Пропустити заголовок
  const dataLines = lines.slice(1)
  
  console.log(`📦 Починаю імпорт ${dataLines.length} товарів...`)
  console.log(`📍 URL: ${DIRECTUS_URL}`)
  console.log('')

  let success = 0
  let failed = 0
  let skipped = 0
  
  // Імпортувати батчами по 10
  const batchSize = 10
  
  for (let i = 0; i < dataLines.length; i += batchSize) {
    const batch = dataLines.slice(i, i + batchSize)
    
    const promises = batch.map(async (line, batchIndex) => {
      const index = i + batchIndex + 1
      const fields = parseCSVLine(line)
      
      if (fields.length < 6) {
        skipped++
        return
      }
      
      const [category, brand, productName, variant, sku, priceStr, oldPriceStr, , , , , visible, , , , , , description, imagesStr, url] = fields
      
      // Пропустити невидимі товари
      if (visible === '0') {
        skipped++
        return
      }
      
      const price = parseFloat(priceStr?.replace(',', '.') || '0')
      const oldPrice = parseFloat(oldPriceStr?.replace(',', '.') || '0')
      
      if (price <= 0) {
        skipped++
        return
      }
      
      const dimensions = extractDimensions(variant || '')
      const cleanedDescription = cleanDescription(description || '')
      
      // Визначити колір з категорії або назви товару
      let color = ''
      const colorMatch = (productName || '').match(/(Чорний|Білий|Сірий|Бежевий|Коричневий|Синій|Зелений|Червоний|Рожевий|Блакитний|Пісочний|Молочний|Кремовий|Графіт|Антрацит|Венге)/i)
      if (colorMatch) {
        color = colorMatch[1]
      }
      
      // Визначити матеріал
      let material = ''
      if (productName?.includes('Тюль')) material = 'Тюль'
      if (productName?.includes('Блекаут')) material = material ? `${material}/Блекаут` : 'Блекаут'
      if (productName?.includes('Льон')) material = 'Льон'
      if (productName?.includes('Велюр')) material = 'Велюр'
      
      const directusProduct: DirectusProduct = {
        status: 'published',
        slug: generateSlug(productName || 'product', variant || '', index),
        name: variant ? `${productName} ${variant}`.trim() : (productName || `Товар ${index}`),
        description: cleanedDescription || 'Римська штора - сучасний та практичний виріб для вашого вікна.',
        price: price,
        old_price: oldPrice > price ? oldPrice : null,
        sku: sku || `SKU-${index}`,
        material: material || null,
        color: color || null,
        width: dimensions.width,
        height: dimensions.height,
        in_stock: true,
        is_new: index <= 50, // Перші 50 - нові
        is_hit: index % 10 === 0, // Кожен 10-й - хіт
        rating: 0,
        reviews_count: 0,
      }

      const created = await createProduct(directusProduct)
      if (created) {
        success++
        if (success % 50 === 0) {
          console.log(`✅ Імпортовано ${success} товарів...`)
        }
      } else {
        failed++
      }
    })
    
    await Promise.all(promises)
    
    // Невелика затримка між батчами
    if (i + batchSize < dataLines.length) {
      await new Promise(resolve => setTimeout(resolve, 200))
    }
  }

  console.log('')
  console.log('═'.repeat(50))
  console.log(`✅ Успішно імпортовано: ${success}`)
  console.log(`❌ Помилок: ${failed}`)
  console.log(`⏭️  Пропущено: ${skipped}`)
  console.log(`📊 Всього оброблено: ${dataLines.length}`)
}

main().catch(console.error)
