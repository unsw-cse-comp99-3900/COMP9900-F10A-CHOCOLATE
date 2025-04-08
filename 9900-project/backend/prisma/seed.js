require('dotenv').config({ path: __dirname + '/../.env' }); 
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Step 1: Create a FARMER user
  const farmer = await prisma.user.upsert({
    where: { email: 'farmer@example.com' },
    update: {},
    create: {
      name: 'Demo Farmer',
      email: 'farmer@example.com',
      password: '123456', // If using hashing in production, replace with hashed password
      role: 'FARMER'
    }
  });
  console.log(`👨‍🌾 Farmer created: ${farmer.name} (${farmer.email})`);

  // Step 2: Create a store for the farmer
  const store = await prisma.store.upsert({
    where: {
      name: "Demo Store" 
    },
    update: {},
    create: {
      name: "Demo Store",
      ownerId: farmer.id, 
    }
  });
  console.log(`🏪 Store created: ${store.name}`);

  // Step 3: Define sample products across multiple categories
  const products = [
    // WHEAT
    { name: "Whole Wheat", category: "WHEAT", price: 10.0 },
    { name: "Wheat Flour", category: "WHEAT", price: 11.0 },
    { name: "Wheat Bran", category: "WHEAT", price: 9.0 },
    { name: "Semolina", category: "WHEAT", price: 10.5 },
    { name: "Wheat Germ", category: "WHEAT", price: 10.2 },

    // SUGAR CANE
    { name: "Raw Sugar", category: "SUGAR_CANE", price: 8.0 },
    { name: "Brown Sugar", category: "SUGAR_CANE", price: 8.5 },
    { name: "Molasses", category: "SUGAR_CANE", price: 7.5 },
    { name: "Jaggery", category: "SUGAR_CANE", price: 7.0 },
    { name: "Cane Syrup", category: "SUGAR_CANE", price: 7.2 },

    // LENTILS
    { name: "Red Lentils", category: "LENTILS", price: 6.0 },
    { name: "Green Lentils", category: "LENTILS", price: 6.2 },
    { name: "Yellow Lentils", category: "LENTILS", price: 6.5 },
    { name: "Black Lentils", category: "LENTILS", price: 6.8 },
    { name: "Split Peas", category: "LENTILS", price: 5.9 },

    // FRUIT
    { name: "Apples", category: "FRUIT", price: 4.0 },
    { name: "Bananas", category: "FRUIT", price: 3.5 },
    { name: "Oranges", category: "FRUIT", price: 4.2 },
    { name: "Berries", category: "FRUIT", price: 5.5 },
    { name: "Grapes", category: "FRUIT", price: 4.8 },

    // VEGGIE
    { name: "Tomatoes", category: "VEGGIE", price: 2.5 },
    { name: "Carrots", category: "VEGGIE", price: 2.8 },
    { name: "Spinach", category: "VEGGIE", price: 3.0 },
    { name: "Broccoli", category: "VEGGIE", price: 3.2 },
    { name: "Potatoes", category: "VEGGIE", price: 2.3 },
  ];

  // Step 4: Create products in the database
  for (const product of products) {
    await prisma.product.create({
      data: {
        ...product,
        quantity: 100,
        storeId: store.id
      }
    });
    console.log(`✅ Product added: ${product.name}`);
  }
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
