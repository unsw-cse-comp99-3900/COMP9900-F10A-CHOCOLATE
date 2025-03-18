const { PrismaClient, UserRole, OrderStatus, ProductCategory } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // 1️⃣ 创建 5 个农民 (FARMER)
  const farmers = await prisma.$transaction(
    Array.from({ length: 5 }).map((_, i) =>
      prisma.user.create({
        data: {
          email: `farmer${i + 1}@example.com`,
          password: "password123",
          name: `Farmer ${i + 1}`,
          phone: `13900138${i}`,
          address: `Farm ${i + 1} Road, Countryside`,
          role: UserRole.FARMER, // ✅ 使用 Prisma Enum
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
          ownerId: farmer.id, // 关联农民
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })
    )
  );

  // 3️⃣ 创建 10 个产品 (Product)
  const products = await prisma.$transaction(
    stores.flatMap((store, i) =>
      Array.from({ length: 2 }).map((_, j) =>
        prisma.product.create({
          data: {
            name: `Product ${i * 2 + j + 1}`,
            description: `High quality Product ${i * 2 + j + 1}`,
            price: parseFloat((Math.random() * 100).toFixed(2)),
            quantity: Math.floor(Math.random() * 50) + 1,
            imageUrl: `/product${i * 2 + j + 1}.jpg`,
            category: j % 2 === 0 ? ProductCategory.VEGGIE : ProductCategory.FRUIT, // ✅ 使用 Enum
            storeId: store.id, // 关联店铺
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        })
      )
    )
  );

  // 4️⃣ 创建 5 个顾客 (CUSTOMER)
  const customers = await prisma.$transaction(
    Array.from({ length: 5 }).map((_, i) =>
      prisma.user.create({
        data: {
          email: `customer${i + 1}@example.com`,
          password: "password123",
          name: `Customer ${i + 1}`,
          phone: `13800138${i}`,
          address: `City Center ${i + 1}`,
          role: UserRole.CUSTOMER, // ✅ 使用 Prisma Enum
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
          status: Object.values(OrderStatus)[i % Object.keys(OrderStatus).length], // ✅ 选择合法 Enum 值
          customerId: customer.id, // 关联顾客
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })
    )
  );

  // 6️⃣ 每个订单包含 2 个订单项 (OrderItem)
  await prisma.$transaction(
    orders.flatMap((order, i) =>
      Array.from({ length: 2 }).map(() =>
        prisma.orderItem.create({
          data: {
            orderId: order.id, // 关联订单
            productId: products[i % products.length].id, // 关联产品
            quantity: Math.floor(Math.random() * 5) + 1,
            price: products[i % products.length].price, // Float
            createdAt: new Date(), // ✅ 删除 `updatedAt`
          },
        })
      )
    )
  );

  // 7️⃣ 为部分店铺添加评价 (Review)
  await prisma.$transaction(
    customers.map((customer, i) =>
      prisma.review.create({
        data: {
          rating: Math.floor(Math.random() * 5) + 1, // Int
          comment: `Great service and products from Fresh Market ${i + 1}`,
          userId: customer.id, // 评价者是顾客
          storeId: stores[i % stores.length].id, // 评价的店铺
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })
    )
  );

  console.log("✅ Seeding finished successfully.");
}

main()
  .catch((error) => {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
