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

// Статистика
const stats = {
  categories: 0,
  products: 0,
  updated: 0,
  skipped: 0,
  errors: 0
};

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
  
  // Обробляємо кожен рядок
  console.log('🔄 Імпорт даних...');
  console.log();
  
  let processedRows = 0;
  
  for (const row of rows) {
    processedRows++;
    
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
    
    // Формуємо повну назву з варіантом
    const fullName = variantTitle ? `${productName} ${variantTitle}` : productName;
    
    // Генеруємо унікальний slug з варіантом
    let productSlug = urlSlug;
    if (variantTitle) {
      const variantSlug = generateSlug(variantTitle);
      productSlug = `${urlSlug}-${variantSlug}`;
    }
    
    // Генеруємо SKU якщо порожній
    const finalSku = sku || generateSku(productName, variantTitle, processedRows);
    
    // Виводимо перші 5 записів для перевірки в DRY_RUN режимі
    if (DRY_RUN && processedRows <= 5) {
      console.log(`📦 Запис #${processedRows}:`);
      console.log(`   Категорія: ${categoryPath}`);
      console.log(`   Бренд: ${brandName}`);
      console.log(`   Назва: ${fullName}`);
      console.log(`   Slug: ${productSlug}`);
      console.log(`   SKU: ${finalSku}`);
      console.log(`   Ціна: ${price} грн`);
      console.log(`   Стара ціна: ${oldPrice || '-'}`);
      console.log();
    }
    
    // Прогрес кожні 100 рядків
    if (processedRows % 100 === 0) {
      console.log(`   Оброблено: ${processedRows}/${rows.length} (продуктів: ${stats.products}, категорій: ${stats.categories})`);
    }
    
    // Створюємо/отримуємо категорію
    const categoryId = await upsertCategoryPath(categoryPath);
    
    // Формуємо опис з брендом
    let fullDescription = description || '';
    if (brandName) {
      fullDescription = `<p><strong>Бренд:</strong> ${brandName}</p>\n${fullDescription}`;
    }
    
    // Дані продукту (відповідно до структури Directus)
    const productData = {
      name: fullName,
      description: fullDescription,
      price: price,
      old_price: oldPrice,
      category: categoryId,
      sku: finalSku,
      color: color,
      material: material
    };
    
    // Створюємо/оновлюємо продукт
    const productId = await upsertProduct(productSlug, productData);
    
    if (!DRY_RUN && productId && stats.products % 10 === 0) {
      console.log(`   ✅ ${stats.products}: ${fullName.substring(0, 50)}...`);
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
