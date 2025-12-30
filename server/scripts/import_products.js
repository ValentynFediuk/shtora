/**
 * Скрипт імпорту товарів з CSV (OkayCMS формат) у Directus
 * 
 * Використання:
 *   DRY_RUN=true node import_products.js           # Тестовий прогін
 *   node import_products.js                         # Повний імпорт
 * 
 * Змінні середовища:
 *   DIRECTUS_URL     - URL Directus (за замовчуванням: http://localhost:8055)
 *   DIRECTUS_TOKEN   - Токен доступу Directus (обов'язково)
 *   CSV_FILE         - Шлях до CSV файлу
 *   DRY_RUN          - Режим тестування без запису (true/false)
 */

// Disable SSL verification for self-signed certificates (local dev/proxies)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import fs from 'fs';
import iconv from 'iconv-lite';
import { parse } from 'csv-parse/sync';
import { createDirectus, rest, staticToken, readItems, createItem, updateItem } from '@directus/sdk';
import pLimit from 'p-limit';
import slugify from 'slugify';

// Конфігурація
const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN;
const CSV_FILE = process.env.CSV_FILE || '/Users/valentynfediuk/Downloads/Telegram Desktop/export (58).csv';
const DRY_RUN = process.env.DRY_RUN === 'true';

// Перевірка токена
if (!DIRECTUS_TOKEN && !DRY_RUN) {
  console.error('❌ Помилка: Встановіть змінну DIRECTUS_TOKEN');
  console.log('   Отримайте токен в Directus: Settings → Access Tokens');
  process.exit(1);
}

// Ініціалізація Directus клієнта
const client = DIRECTUS_TOKEN 
  ? createDirectus(DIRECTUS_URL).with(staticToken(DIRECTUS_TOKEN)).with(rest())
  : null;

// Обмежувач паралельних запитів
const limit = pLimit(3);

// Кеш для категорій
const categoryCache = new Map();
const productCache = new Map();
// Кеш для консолідації варіантів продуктів
const productVariantsCache = new Map();
const sizeCache = new Map();

// Статистика
const stats = {
  categories: 0,
  products: 0,
  updated: 0,
  skipped: 0,
  errors: 0,
  sizes_created: 0,
  sizes_found: 0,
  prices_created: 0,
  prices_updated: 0,
};

/**
 * Парсинг розміру з варіанту (наприклад "100*170 см" -> {width: 100, height: 170})
 */
function parseVariantSize(variant) {
  if (!variant) return null;
  const match = variant.match(/(\d+)\s*[*×x]\s*(\d+)/i);
  if (match) {
    return {
      width: parseInt(match[1], 10),
      height: parseInt(match[2], 10)
    };
  }
  return null;
}

/**
 * Розрахунок ціни за кв.м
 */
function calculatePricePerSqm(variants) {
  if (!variants || variants.length === 0) return null;
  
  const pricesPerSqm = variants
    .filter(v => v.width && v.height && v.price)
    .map(v => {
      const area = (v.width / 100) * (v.height / 100);
      return v.price / area;
    });
  
  if (pricesPerSqm.length === 0) return null;
  
  const avg = pricesPerSqm.reduce((a, b) => a + b, 0) / pricesPerSqm.length;
  return Math.round(avg * 100) / 100;
}

/**
 * Отримання полів калькулятора з варіантів
 */
function getCalculatorFields(variants) {
  if (!variants || variants.length === 0) return {};
  
  const validVariants = variants.filter(v => v.width && v.height);
  if (validVariants.length === 0) return {};
  
  const widths = validVariants.map(v => v.width);
  const heights = validVariants.map(v => v.height);
  
  const minWidth = Math.min(...widths);
  const maxWidth = Math.max(...widths);
  const uniqueHeights = [...new Set(heights)];
  const fixedHeight = uniqueHeights.length === 1 ? uniqueHeights[0] : null;
  
  const pricePerSqm = calculatePricePerSqm(validVariants);
  
  return {
    price_per_sqm: pricePerSqm,
    min_width: minWidth,
    max_width: maxWidth,
    min_height: fixedHeight ? null : Math.min(...heights),
    max_height: fixedHeight ? null : Math.max(...heights),
    fixed_height: fixedHeight,
    sizes: validVariants.map(v => `${v.width}x${v.height}`)
  };
}

/**
 * Конвертація значення в boolean
 */
function toBool(value) {
  return String(value || '').trim() === '1';
}

/**
 * Очищення порожніх значень
 */
function noEmpty(value) {
  const str = String(value || '').trim();
  return str.length > 0 ? str : null;
}

/**
 * Безпечний парсинг числа
 */
function parseNumber(value, defaultValue = 0) {
  const num = parseFloat(String(value || '').replace(',', '.'));
  return isNaN(num) ? defaultValue : num;
}

/**
 * Генерація slug з назви
 */
function generateSlug(text) {
  if (!text) return null;
  return slugify(text, {
    lower: true,
    strict: true,
    locale: 'uk'
  });
}

/**
 * Отримання значення з рядка CSV
 */
function pick(row, key) {
  return row[key] ?? row[key.trim()] ?? null;
}

/**
 * Генерація унікального SKU
 */
function generateSku(name, variant, index) {
  const base = generateSlug(name) || 'product';
  const variantPart = variant ? '-' + generateSlug(variant) : '';
  return `${base}${variantPart}-${index}`.substring(0, 50);
}

/**
 * Створення або отримання категорії з ієрархією
 */
async function upsertCategoryPath(pathStr) {
  if (!pathStr) return null;
  
  const parts = pathStr.split('/').map(p => p.trim()).filter(Boolean);
  if (parts.length === 0) return null;
  
  let parentId = null;
  let fullPath = '';
  
  for (const name of parts) {
    fullPath = fullPath ? `${fullPath}/${name}` : name;
    
    // Перевіряємо кеш
    const cacheKey = fullPath;
    if (categoryCache.has(cacheKey)) {
      parentId = categoryCache.get(cacheKey);
      continue;
    }
    
    const slug = generateSlug(name);
    
    if (DRY_RUN) {
      const fakeId = `cat_${stats.categories + 1}`;
      categoryCache.set(cacheKey, fakeId);
      parentId = fakeId;
      stats.categories++;
      continue;
    }
    
    try {
      // Шукаємо існуючу категорію
      const filter = {
        slug: { _eq: slug }
      };
      if (parentId) {
        filter.parent = { _eq: parentId };
      } else {
        filter.parent = { _null: true };
      }
      
      const existing = await client.request(
        readItems('categories', { filter, limit: 1 })
      );
      
      if (existing && existing.length > 0) {
        parentId = existing[0].id;
        categoryCache.set(cacheKey, parentId);
        continue;
      }
      
      // Створюємо нову категорію
      const created = await client.request(
        createItem('categories', {
          name,
          slug,
          parent: parentId,
          products_count: 0
        })
      );
      
      parentId = created.id;
      categoryCache.set(cacheKey, parentId);
      stats.categories++;
      console.log(`  📁 Категорія: ${fullPath}`);
      
    } catch (error) {
      console.error(`  ❌ Помилка категорії "${name}":`, error.message);
      stats.errors++;
    }
  }
  
  return parentId;
}

/**
 * Створення або оновлення продукту
 */
async function upsertProduct(slug, data) {
  if (!slug) return null;
  
  // Перевіряємо кеш
  if (productCache.has(slug)) {
    stats.skipped++;
    return productCache.get(slug);
  }
  
  if (DRY_RUN) {
    const fakeId = `product_${stats.products + 1}`;
    productCache.set(slug, fakeId);
    stats.products++;
    return fakeId;
  }
  
  try {
    // Шукаємо існуючий продукт
    const existing = await client.request(
      readItems('products', { 
        filter: { slug: { _eq: slug } }, 
        limit: 1 
      })
    );
    
    if (existing && existing.length > 0) {
      // Оновлюємо існуючий
      await client.request(
        updateItem('products', existing[0].id, data)
      );
      productCache.set(slug, existing[0].id);
      stats.updated++;
      return existing[0].id;
    }
    
    // Створюємо новий продукт
    const created = await client.request(
      createItem('products', {
        slug,
        ...data,
        status: 'published'
      })
    );
    
    productCache.set(slug, created.id);
    stats.products++;
    
    return created.id;
    
  } catch (error) {
    console.error(`  ❌ Помилка продукту "${slug}":`, error.message);
    stats.errors++;
    return null;
  }
}

/**
 * Створення або оновлення розміру (sizes)
 */
async function upsertSize(width, height) {
  if (!width || !height) return null;
  const key = `${width}x${height}`;
  
  if (sizeCache.has(key)) return sizeCache.get(key);
  
  if (DRY_RUN) {
    const fakeId = `size_${stats.sizes_created + 1}`;
    sizeCache.set(key, fakeId);
    return fakeId;
  }

  try {
    // Шукаємо існуючий розмір
    const existing = await client.request(
      readItems('sizes', {
        filter: {
          _and: [
            { width: { _eq: width } },
            { height: { _eq: height } }
          ]
        },
        limit: 1
      })
    );
    
    if (existing && existing.length > 0) {
      sizeCache.set(key, existing[0].id);
      stats.sizes_found++;
      return existing[0].id;
    }
    
    // Створюємо новий
    const created = await client.request(
      createItem('sizes', {
        width,
        height,
        name: `${width}x${height} см`
      })
    );
    
    sizeCache.set(key, created.id);
    stats.sizes_created++;
    return created.id;
  } catch (error) {
    console.error(`  ❌ Помилка розміру ${key}:`, error.message);
    stats.errors++;
    return null;
  }
}

/**
 * Створення або оновлення ціни (prices)
 */
async function upsertPrice(productId, sizeId, price, oldPrice) {
  if (!client || !productId || !sizeId) return null;

  if (DRY_RUN) {
    console.log(`      ↳ Ціна: ${price} (SizeID: ${sizeId})`);
    return null;
  }

  try {
    const existing = await client.request(
      readItems('prices', {
        filter: {
          _and: [
            { product: { _eq: productId } },
            { size: { _eq: sizeId } }
          ]
        },
        limit: 1
      })
    );

    if (existing && existing.length > 0) {
      await client.request(
        updateItem('prices', existing[0].id, {
          price,
          old_price: oldPrice || null
        })
      );
      stats.prices_updated++;
      return existing[0].id;
    }

    const created = await client.request(
      createItem('prices', {
        product: productId,
        size: sizeId,
        price,
        old_price: oldPrice || null
      })
    );
    stats.prices_created++;
    return created.id;
  } catch (error) {
    console.error('  ❌ Помилка ціни:', error.message);
    stats.errors++;
    return null;
  }
}

/**
 * Створення або оновлення варіанта (через sizes + prices)
 */
async function upsertProductVariant(productId, variant) {
  if (!productId || !variant || !variant.width || !variant.height || !variant.price) return null;

  const sizeId = await upsertSize(variant.width, variant.height);
  if (sizeId) {
    await upsertPrice(productId, sizeId, variant.price, variant.oldPrice);
  }
}

/**
 * Головна функція імпорту
 */
async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║       ІМПОРТ ТОВАРІВ З CSV В DIRECTUS                      ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log();
  
  if (DRY_RUN) {
    console.log('🔍 РЕЖИМ ТЕСТУВАННЯ (DRY_RUN) - дані НЕ будуть записані');
    console.log();
  }
  
  // Перевіряємо наявність файлу
  if (!fs.existsSync(CSV_FILE)) {
    console.error(`❌ Файл не знайдено: ${CSV_FILE}`);
    process.exit(1);
  }
  
  console.log(`📄 Файл: ${CSV_FILE}`);
  console.log(`🌐 Directus: ${DIRECTUS_URL}`);
  console.log();
  
  // Читаємо та декодуємо файл з CP1251
  console.log('📖 Читання та декодування файлу (CP1251 → UTF-8)...');
  const buffer = fs.readFileSync(CSV_FILE);
  const content = iconv.decode(buffer, 'win1251');
  
  // Парсимо CSV
  console.log('📊 Парсинг CSV...');
  const rows = parse(content, {
    delimiter: ';',
    columns: true,
    relax_quotes: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true
  });
  
  console.log(`   Знайдено рядків: ${rows.length}`);
  console.log();
  
  // ПРОХІД 1: Збираємо та консолідуємо варіанти
  console.log('📦 Консолідація варіантів продуктів...');
  console.log();
  
  const consolidatedProducts = new Map();
  
  for (const row of rows) {
    // Витягуємо дані з рядка
    const categoryPath = noEmpty(pick(row, 'Category'));
    const brandName = noEmpty(pick(row, 'Brand'));
    const productName = noEmpty(pick(row, 'Product'));
    const variantTitle = noEmpty(pick(row, 'Variant'));
    const sku = noEmpty(pick(row, 'SKU'));
    const price = parseNumber(pick(row, 'Price'));
    const oldPrice = parseNumber(pick(row, 'Old price')) || null;
    const description = noEmpty(pick(row, 'Description'));
    const urlSlug = noEmpty(pick(row, 'URL'));
    const color = noEmpty(pick(row, 'Колір')) || noEmpty(pick(row, 'колір'));
    const material = noEmpty(pick(row, 'Матеріал')) || noEmpty(pick(row, 'матеріал'));
    
    // Пропускаємо рядки без назви
    if (!productName) {
      continue;
    }
    
    // Використовуємо базовий URL як ключ для консолідації
    const baseSlug = urlSlug || generateSlug(productName);
    
    // Парсимо розмір з варіанту
    const size = parseVariantSize(variantTitle);
    
    if (!consolidatedProducts.has(baseSlug)) {
      consolidatedProducts.set(baseSlug, {
        name: productName,
        description: description,
        brandName: brandName,
        categoryPath: categoryPath,
        color: color,
        material: material,
        sku: sku,
        variants: []
      });
    }
    
    // Додаємо варіант
    consolidatedProducts.get(baseSlug).variants.push({
      width: size?.width || null,
      height: size?.height || null,
      price: price,
      oldPrice: oldPrice,
      variantTitle: variantTitle
    });
  }
  
  console.log(`   Консолідовано в ${consolidatedProducts.size} унікальних продуктів`);
  console.log();
  
  // ПРОХІД 2: Імпорт консолідованих продуктів
  console.log('🔄 Імпорт даних...');
  console.log();
  
  let processedProducts = 0;
  
  for (const [baseSlug, productInfo] of consolidatedProducts) {
    processedProducts++;
    
    // Отримуємо поля калькулятора з варіантів
    const calculatorFields = getCalculatorFields(productInfo.variants);
    
    // Знаходимо мінімальну ціну для базової ціни
    const prices = productInfo.variants.map(v => v.price).filter(Boolean);
    const oldPrices = productInfo.variants.map(v => v.oldPrice).filter(Boolean);
    const basePrice = prices.length > 0 ? Math.min(...prices) : 0;
    const baseOldPrice = oldPrices.length > 0 ? Math.min(...oldPrices) : null;
    
    // Виводимо перші 5 продуктів для перевірки в DRY_RUN режимі
    if (DRY_RUN && processedProducts <= 5) {
      console.log(`📦 Продукт #${processedProducts}:`);
      console.log(`   Назва: ${productInfo.name}`);
      console.log(`   Slug: ${baseSlug}`);
      console.log(`   Варіантів: ${productInfo.variants.length}`);
      console.log(`   Базова ціна: ${basePrice} грн`);
      if (calculatorFields.price_per_sqm) {
        console.log(`   💰 Ціна за м²: ${calculatorFields.price_per_sqm} грн`);
        console.log(`   📐 Ширина: ${calculatorFields.min_width}-${calculatorFields.max_width} см`);
        if (calculatorFields.fixed_height) {
          console.log(`   📐 Висота: ${calculatorFields.fixed_height} см (фіксована)`);
        } else {
          console.log(`   📐 Висота: ${calculatorFields.min_height}-${calculatorFields.max_height} см`);
        }
      }
      console.log();
    }
    
    // Прогрес кожні 50 продуктів
    if (processedProducts % 50 === 0) {
      console.log(`   Оброблено: ${processedProducts}/${consolidatedProducts.size} (продуктів: ${stats.products}, категорій: ${stats.categories})`);
    }
    
    // Створюємо/отримуємо категорію
    const categoryId = await upsertCategoryPath(productInfo.categoryPath);
    
    // Формуємо опис з брендом
    let fullDescription = productInfo.description || '';
    if (productInfo.brandName) {
      fullDescription = `<p><strong>Бренд:</strong> ${productInfo.brandName}</p>\n${fullDescription}`;
    }
    
    // Генеруємо SKU
    const finalSku = productInfo.sku || generateSku(productInfo.name, null, processedProducts);
    
    // Дані продукту (відповідно до структури Directus) з полями калькулятора
    const productData = {
      name: productInfo.name,
      description: fullDescription,
      price: basePrice,
      old_price: baseOldPrice,
      category: categoryId,
      sku: finalSku,
      color: productInfo.color,
      material: productInfo.material,
      // Поля калькулятора
      price_per_sqm: calculatorFields.price_per_sqm || null,
      min_width: calculatorFields.min_width || null,
      max_width: calculatorFields.max_width || null,
      min_height: calculatorFields.min_height || null,
      max_height: calculatorFields.max_height || null,
      fixed_height: calculatorFields.fixed_height || null,
      sizes: calculatorFields.sizes || null
    };
    
    // Створюємо/оновлюємо продукт
    const productId = await upsertProduct(baseSlug, productData);
    
    // Імпорт варіантів розмірів з точними цінами
    if (productId) {
      const variants = productInfo.variants || [];
      for (const v of variants) {
        // нормалізуємо стару ціну до oldPrice ключа
        const variant = {
          width: v.width,
          height: v.height,
          price: v.price,
          oldPrice: v.oldPrice ?? v.old_price ?? null,
        };
        await upsertProductVariant(productId, variant);
      }
    }

    if (!DRY_RUN && productId && stats.products % 10 === 0) {
      console.log(`   ✅ ${stats.products}: ${productInfo.name.substring(0, 50)}...`);
    }
  }
  
  // Виводимо статистику
  console.log();
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                      РЕЗУЛЬТАТИ                            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log();
  console.log(`   📁 Категорій створено:  ${stats.categories}`);
  console.log(`   📦 Продуктів створено:  ${stats.products}`);
  console.log(`   🔄 Продуктів оновлено:  ${stats.updated}`);
  console.log(`   ⏭️  Пропущено (дублі):   ${stats.skipped}`);
  console.log(`   ❌ Помилок:             ${stats.errors}`);
  console.log(`   📏 Розмірів створено:   ${stats.sizes_created} (знайдено: ${stats.sizes_found})`);
  console.log(`   💰 Цін створено:        ${stats.prices_created}`);
  console.log(`   🔄 Цін оновлено:        ${stats.prices_updated}`);
  console.log();
  
  if (DRY_RUN) {
    console.log('💡 Це був тестовий прогін. Для реального імпорту:');
    console.log('   DIRECTUS_TOKEN=ваш_токен node import_products.js');
    console.log();
  } else {
    console.log('✅ Імпорт завершено!');
  }
}

// Запуск
main().catch(error => {
  console.error('❌ Критична помилка:', error);
  process.exit(1);
});
