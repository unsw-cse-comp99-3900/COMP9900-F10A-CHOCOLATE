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

  // 3️⃣ 创建产品 (Product)
  const products = await prisma.$transaction(
    stores.flatMap((store, i) =>
      Array.from({ length: 5 }).map((_, j) => {
        // Determine category
        const categoryIndex = (i * 5 + j) % 5;
        const categories = [
          ProductCategory.WHEAT,
          ProductCategory.SUGAR_CANE,
          ProductCategory.LENTILS,
          ProductCategory.FRUIT,
          ProductCategory.VEGGIE
        ];
        const category = categories[categoryIndex];
        
        // Generate category-specific product names
        let productName, productDescription;
        switch(category) {
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
            category: category, 
            storeId: store.id, // 关联店铺
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
      Array.from({ length: 3 }).map((_, j) => {
        // Select product of different categories for each order
        // This ensures each category is represented in orders
        const productIndex = (i + j * 5) % products.length; // Spread out product selection
        const selectedProduct = products[productIndex];
        
        return prisma.orderItem.create({
          data: {
            orderId: order.id, // 关联订单
            productId: selectedProduct.id, // 关联产品
            quantity: Math.floor(Math.random() * 5) + 1,
            price: selectedProduct.price, // Float
            createdAt: new Date(), // ✅ 删除 `updatedAt`
          },
        });
      })
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
