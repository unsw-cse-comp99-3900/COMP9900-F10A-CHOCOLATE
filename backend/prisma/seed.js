const { PrismaClient, UserRole, OrderStatus, ProductCategory } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
require('dotenv').config();

console.log("Starting seed script...");

async function main() {
  console.log("🌱 Seeding database...");

  try {
    // ✅ Hash the password once for all users
    const hashedPassword = await bcrypt.hash("password123", 10);
    console.log("Password hashed successfully");

    // 1️⃣ 创建 5 个农民 (FARMER)
    console.log("Creating farmers...");
    const farmers = await prisma.$transaction(
      Array.from({ length: 5 }).map((_, i) =>
        prisma.user.create({
          data: {
            email: `farmer${i + 1}@example.com`,
            password: hashedPassword,
            name: `Farmer ${i + 1}`,
            phone: `13900138${i}`,
            address: `Farm ${i + 1} Road, Countryside`,
            role: UserRole.FARMER,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        })
      )
    );

    // 2️⃣ 为每个农民创建一个店铺 (Store)
    const stores = await prisma.$transaction(
      farmers.map((farmer, i) =>
        prisma.store.create({
          data: {
            name: `Fresh Market ${i + 1}`,
            description: `High-quality fresh products from Fresh Market ${i + 1}`,
            imageUrl: `/farmer${i + 1}.jpg`,
            rating: parseFloat((Math.random() * 5).toFixed(1)),
            ownerId: farmer.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        })
      )
    );

    // 3️⃣ 创建产品 (Product)
    const products = await prisma.$transaction(
      stores.flatMap((store, i) =>
        Array.from({ length: 5 }).map((_, j) => {
          const categoryIndex = (i * 5 + j) % 5;
          const categories = [
            ProductCategory.WHEAT,
            ProductCategory.SUGAR_CANE,
            ProductCategory.LENTILS,
            ProductCategory.FRUIT,
            ProductCategory.VEGGIE,
          ];
          const category = categories[categoryIndex];

          let productName, productDescription;
          switch (category) {
            case ProductCategory.WHEAT:
              productName = `Organic Wheat ${i * 5 + j + 1}`;
              productDescription = `High quality organic wheat from Farm ${i + 1}`;
              break;
            case ProductCategory.SUGAR_CANE:
              productName = `Sweet Sugar Cane ${i * 5 + j + 1}`;
              productDescription = `Fresh sweet sugar cane from Farm ${i + 1}`;
              break;
            case ProductCategory.LENTILS:
              productName = `Premium Lentils ${i * 5 + j + 1}`;
              productDescription = `Nutrient-rich lentils from Farm ${i + 1}`;
              break;
            case ProductCategory.FRUIT:
              productName = `Fresh Fruit ${i * 5 + j + 1}`;
              productDescription = `Juicy seasonal fruits from Farm ${i + 1}`;
              break;
            case ProductCategory.VEGGIE:
              productName = `Organic Vegetables ${i * 5 + j + 1}`;
              productDescription = `Locally grown vegetables from Farm ${i + 1}`;
              break;
            default:
              productName = `Product ${i * 5 + j + 1}`;
              productDescription = `High quality product from Farm ${i + 1}`;
          }

          return prisma.product.create({
            data: {
              name: productName,
              description: productDescription,
              price: parseFloat((Math.random() * 100).toFixed(2)),
              quantity: Math.floor(Math.random() * 50) + 1,
              imageUrl: `/product${i * 5 + j + 1}.jpg`,
              category,
              storeId: store.id,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          });
        })
      )
    );

    // 4️⃣ 创建 5 个顾客 (CUSTOMER)
    const customers = await prisma.$transaction(
      Array.from({ length: 5 }).map((_, i) =>
        prisma.user.create({
          data: {
            email: `customer${i + 1}@example.com`,
            password: hashedPassword,
            name: `Customer ${i + 1}`,
            phone: `13800138${i}`,
            address: `City Center ${i + 1}`,
            role: UserRole.CUSTOMER,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        })
      )
    );

    // 5️⃣ 为每个顾客创建一个订单 (Order)
    const orders = await prisma.$transaction(
      customers.map((customer, i) =>
        prisma.order.create({
          data: {
            totalAmount: parseFloat((Math.random() * 500).toFixed(2)),
            status: Object.values(OrderStatus)[i % Object.keys(OrderStatus).length],
            customerId: customer.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        })
      )
    );

    // 6️⃣ 每个订单包含 3 个订单项 (OrderItem)
    await prisma.$transaction(
      orders.flatMap((order, i) =>
        Array.from({ length: 3 }).map((_, j) => {
          const productIndex = (i + j * 5) % products.length;
          const selectedProduct = products[productIndex];

          return prisma.orderItem.create({
            data: {
              orderId: order.id,
              productId: selectedProduct.id,
              quantity: Math.floor(Math.random() * 5) + 1,
              price: selectedProduct.price,
              createdAt: new Date(),
            },
          });
        })
      )
    );

    // 7️⃣ 创建评价 (Review)
    await prisma.$transaction(
      customers.map((customer, i) =>
        prisma.review.create({
          data: {
            rating: Math.floor(Math.random() * 5) + 1,
            comment: `Great service and products from Fresh Market ${i + 1}`,
            userId: customer.id,
            storeId: stores[i % stores.length].id,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        })
      )
    );

    console.log("✅ Seeding finished successfully.");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  } finally {
    prisma.$disconnect();
  }
}

main();
