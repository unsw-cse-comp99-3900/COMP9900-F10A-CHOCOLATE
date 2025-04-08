const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const store = await prisma.store.findFirst(); // 选择一个已有的店铺（或者手动指定 storeId）

  if (!store) {
    console.log("❌ No store found. Please create a store first.");
    return;
  }

  const products = [
    { name: "Fruit", category: "FRUIT", price: 10.0, quantity: 100, storeId: store.id },
    { name: "Veggie", category: "VEGGIE", price: 8.0, quantity: 120, storeId: store.id },
    { name: "Wheat", category: "WHEAT", price: 15.0, quantity: 80, storeId: store.id },
    { name: "Sugar Cane", category: "SUGAR_CANE", price: 12.0, quantity: 90, storeId: store.id },
    { name: "Lentils", category: "LENTILS", price: 14.0, quantity: 110, storeId: store.id }
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
    console.log(`✅ Product "${product.name}" added to the database.`);
  }
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
