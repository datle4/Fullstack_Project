import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const products = [
  {
    name: "MacBook Air 13 M3 8GB 256GB",
    slug: "macbook-air-13-m3-8gb-256gb",
    brand: "Apple",
    price: "24990000",
    imageUrl: "https://placehold.co/600x400?text=MacBook+Air+M3",
    cpu: "Apple M3",
    ram: "8GB",
    storage: "256GB SSD",
    gpu: "Integrated GPU",
    screen: "13.6 inch Liquid Retina",
    stock: 12,
    isActive: true,
  },
  {
    name: "Dell XPS 13 Intel Core Ultra 7 16GB 512GB",
    slug: "dell-xps-13-core-ultra-7-16gb-512gb",
    brand: "Dell",
    price: "32990000",
    imageUrl: "https://placehold.co/600x400?text=Dell+XPS+13",
    cpu: "Intel Core Ultra 7",
    ram: "16GB",
    storage: "512GB SSD",
    gpu: "Intel Arc Graphics",
    screen: "13.4 inch FHD+",
    stock: 8,
    isActive: true,
  },
  {
    name: "ASUS ROG Strix G16 i7 RTX 4060",
    slug: "asus-rog-strix-g16-i7-rtx-4060",
    brand: "ASUS",
    price: "36990000",
    imageUrl: "https://placehold.co/600x400?text=ROG+Strix+G16",
    cpu: "Intel Core i7",
    ram: "16GB",
    storage: "1TB SSD",
    gpu: "NVIDIA GeForce RTX 4060",
    screen: "16 inch 165Hz",
    stock: 6,
    isActive: true,
  },
  {
    name: "Lenovo ThinkPad X1 Carbon Gen 12",
    slug: "lenovo-thinkpad-x1-carbon-gen-12",
    brand: "Lenovo",
    price: "39990000",
    imageUrl: "https://placehold.co/600x400?text=ThinkPad+X1",
    cpu: "Intel Core Ultra 7",
    ram: "16GB",
    storage: "1TB SSD",
    gpu: "Intel Arc Graphics",
    screen: "14 inch 2.8K OLED",
    stock: 5,
    isActive: true,
  },
];

async function main() {
  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    });
  }

  console.log(`Seeded ${products.length} products`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });