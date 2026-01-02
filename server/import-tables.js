// CommonJS синтаксис, без type: "module"
const { createDirectus } = require('@directus/sdk');

const directus = createDirectus('https://shtora-production.up.railway.app'); // твій PUBLIC_URL
const tables = ['products', 'categories', 'orders']; // встав свої таблиці

async function main() {
  for (const table of tables) {
    try {
      await directus.collections.createOne({
        collection: table,
        meta: { hidden: false },
      });
      console.log('Imported:', table);
    } catch (err) {
      console.log('Skipped:', table, err.message);
    }
  }
}

main();
