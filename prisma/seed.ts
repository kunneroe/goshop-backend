import { prisma } from "../src/prisma/client";

async function main() {
  console.log("Starting seed...");

  // Clear existing catalog data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.supermarket.deleteMany();

  // Create Categories
  const categoryNames = [
    "Groceries",
    "Drinks",
    "Snacks",
    "Toiletries",
    "Household",
    "Frozen Foods",
    "Baby Products",
    "Cleaning Items",
    "Personal Care",
  ];

  const categories = [];
  for (const name of categoryNames) {
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    const cat = await prisma.category.create({
      data: { name, slug },
    });
    categories.push(cat);
  }
  console.log("Created categories.");

  // Create Supermarkets
  const supermarketData = [
    {
      name: "Shoprite Ikeja City Mall",
      slug: "shoprite-ikeja",
      city: "Ikeja",
      state: "Lagos",
      rating: 4.5,
      deliveryFee: 1000,
      imageUrl: "https://example.com/shoprite.jpg",
    },
    {
      name: "Spar Lekki",
      slug: "spar-lekki",
      city: "Lekki",
      state: "Lagos",
      rating: 4.6,
      deliveryFee: 1500,
      imageUrl: "https://example.com/spar.jpg",
    },
    {
      name: "Market Square Ikoyi",
      slug: "market-square-ikoyi",
      city: "Ikoyi",
      state: "Lagos",
      rating: 4.8,
      deliveryFee: 2000,
      imageUrl: "https://example.com/marketsquare.jpg",
    },
    {
      name: "Justrite Egbeda",
      slug: "justrite-egbeda",
      city: "Egbeda",
      state: "Lagos",
      rating: 4.2,
      deliveryFee: 800,
      imageUrl: "https://example.com/justrite.jpg",
    },
    {
      name: "Prince Ebeano Supermarket",
      slug: "ebeano-lekki",
      city: "Lekki",
      state: "Lagos",
      rating: 4.7,
      deliveryFee: 1200,
      imageUrl: "https://example.com/ebeano.jpg",
    },
    {
      name: "FoodCo Ibadan",
      slug: "foodco-ibadan",
      city: "Ibadan",
      state: "Oyo",
      rating: 4.4,
      deliveryFee: 500,
      imageUrl: "https://example.com/foodco.jpg",
    },
  ];

  const supermarkets = [];
  for (const data of supermarketData) {
    const sm = await prisma.supermarket.create({
      data: {
        ...data,
        etaMinMinutes: 30,
        etaMaxMinutes: 60,
      },
    });
    supermarkets.push(sm);
  }
  console.log("Created supermarkets.");

  // Create Products
  const productsData = [
    { name: "Indomie Noodles Onion Chicken 70g", catName: "Groceries", price: 150 },
    { name: "Coca-Cola 50cl PET", catName: "Drinks", price: 300 },
    { name: "Plantain Chips", catName: "Snacks", price: 500 },
    { name: "Dettol Soap Original", catName: "Toiletries", price: 800 },
    { name: "Ariel Detergent 2kg", catName: "Cleaning Items", price: 4500 },
    { name: "Frozen Chicken 1kg", catName: "Frozen Foods", price: 3500 },
    { name: "Pampers Baby Dry Size 4", catName: "Baby Products", price: 7500 },
    { name: "Nivea Body Lotion 400ml", catName: "Personal Care", price: 3200 },
    { name: "Golden Penny Spaghetti 500g", catName: "Groceries", price: 600 },
    { name: "Eva Water 75cl", catName: "Drinks", price: 200 },
  ];

  for (const sm of supermarkets) {
    for (const pData of productsData) {
      const category = categories.find((c) => c.name === pData.catName);
      if (category) {
        await prisma.product.create({
          data: {
            name: pData.name,
            slug: `${pData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${sm.id.substring(0, 5)}`,
            price: pData.price,
            stockQty: 50,
            supermarketId: sm.id,
            categoryId: category.id,
            imageUrl: "https://example.com/product.jpg",
          },
        });
      }
    }
  }
  console.log("Created products.");

  console.log("Seed completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
