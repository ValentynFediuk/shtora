/**
 * Скрипт видалення всіх товарів з Directus
 */

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'https://shtora-production.up.railway.app'
const DIRECTUS_TOKEN = process.env.DIRECTUS_ADMIN_TOKEN || ''

async function deleteAllProducts() {
  if (!DIRECTUS_TOKEN) {
    console.error('❌ Помилка: Не встановлено DIRECTUS_ADMIN_TOKEN')
    process.exit(1)
  }

  console.log('🗑️  Отримую список товарів для видалення...')
  
  let allIds: string[] = []
  let offset = 0
  const limit = 100
  
  while (true) {
    const res = await fetch(`${DIRECTUS_URL}/items/products?fields=id&limit=${limit}&offset=${offset}`, {
      headers: { Authorization: `Bearer ${DIRECTUS_TOKEN}` }
    })
    const data = await res.json()
    if (!data.data || data.data.length === 0) break
    allIds.push(...data.data.map((p: { id: string }) => p.id))
    offset += limit
    process.stdout.write(`\r📊 Знайдено ${allIds.length} товарів...`)
    if (data.data.length < limit) break
  }
  
  console.log(`\n📦 Всього товарів для видалення: ${allIds.length}`)
  
  if (allIds.length === 0) {
    console.log('✅ Товарів немає, видаляти нічого.')
    return
  }
  
  // Видалити батчами
  const batchSize = 100
  for (let i = 0; i < allIds.length; i += batchSize) {
    const batch = allIds.slice(i, i + batchSize)
    const res = await fetch(`${DIRECTUS_URL}/items/products`, {
      method: 'DELETE',
      headers: { 
        Authorization: `Bearer ${DIRECTUS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ keys: batch })
    })
    
    if (!res.ok) {
      console.error(`❌ Помилка видалення: ${await res.text()}`)
    }
    
    console.log(`🗑️  Видалено ${Math.min(i + batchSize, allIds.length)}/${allIds.length}`)
  }
  
  console.log('✅ Всі товари видалено!')
}

deleteAllProducts().catch(console.error)
